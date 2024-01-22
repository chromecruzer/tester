import {UploadTransformerA} from "./UploadTransformerA";
import _ from "lodash";
import {DateTime} from "luxon";
import {AuditItemRecord, ItemMatchStatus, tracDateFormat, uploadHeaders} from "@trac/datatypes";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class AuditTransformer extends UploadTransformerA {
  public convertSpreadsheetRecords(uploadedData: any[]) {
    return uploadedData;
  }
  constructor(storeFactory, schemaName, auditItemTableName,
              private auditTableName, private consignmentSchemaAndTableName, private matchStatus: ItemMatchStatus) {
    super(storeFactory, schemaName, auditItemTableName);
  }

  public async transform(uploadedData: string[], client, token: string, form) {
    const auditRecord = await this.extractLocation(form, client);
    // console.log(`matching the list ${dump(uploadedData)}`);
    if (!_.isEmpty(uploadedData)) {
      auditRecord.items = await this.matchExisting(auditRecord, uploadedData, client);
      // let lotNumbers = _.map(auditRecord.items, i => i.lot);
      // console.log(`audit items found original ${lotNumbers.length} records versus ${_.uniq(lotNumbers).length} unique records`)
      auditRecord.items = _.concat(auditRecord.items, await this.findMissing(auditRecord, uploadedData, client));
      // lotNumbers = _.map(auditRecord.items, i => i.lot);
      // console.log(`audit items with missing found original ${lotNumbers.length} records versus ${_.uniq(lotNumbers).length} unique records`)
    }
    // console.log(`auditRecord ${dump(auditRecord)} and token ${token}`)
    await this.storeFactory.create(token, auditRecord);
  }

  private async findMissing(auditRecord, uploadedData, client) {
    const matchlist = _.map(uploadedData, lot => `'${lot}'`);
    const sql = `SELECT * FROM ${(this.consignmentSchemaAndTableName)}
WHERE customer_id='${auditRecord.location.location_code}'
AND lot NOT IN (${_.join(matchlist,',')});`
    const missing = await client.query(sql)
      .catch(err => {
        throw new Error(`Query '${sql}' failed because ${err.message}`);
      });
    return _.map(missing.rows, m => ({
      lot: m.lot,
      consignment_uuid: m.uuid,
      item: m.item,
      quantity: m.quantity,
      family: m.description4,
      description: m.description,
      expire_date: m.expire_date,
      audit_match: 'Missing',
      last_changed_date: DateTime.utc().toJSDate(),
    }));
  }

  private async matchExisting(auditRecord, uploadedData, client) {
    const matchlist = _.map(uploadedData, lot => `'${lot}'`);
    const now = DateTime.utc().toJSDate();
    const sql = `SELECT * FROM ${(this.consignmentSchemaAndTableName)}
WHERE lot IN (${_.join(matchlist,',')});`
    // console.log(`query for matchlist ${sql}`)
    const matches = await client.query(sql)
      .catch(err => {
        throw new Error(`Query '${sql}' failed because ${err.message}`);
      });

    return _.map(uploadedData, numberColumn => {
      const found = _.find(matches.rows, m => m.lot === numberColumn);
      if (found) {
        const result: AuditItemRecord = {
          lot: numberColumn,
          item: found.item,
          consignment_uuid: found.uuid,
          family: found.description4,
          description: found.description,
          expire_date: found.expire_date,
          audit_match: this.matchStatus.match(auditRecord.location.location_code, found),
          quantity: found.quantity,
          last_changed_date: now
        };
        // console.log(`result match checks ${result.audit_match}
        // has ${result.audit_match === 'Found In Other Location' ? 'moved' : 'not moved'}
        // location ${found.customer_id}`);
        if (result.audit_match === 'Found In Other Location') {
          result.consignment_location = found.customer_id;
          result.consignment_warehouse = found.warehouse;
        }
        return result;
      }
      return {
        lot: numberColumn,
        audit_match: 'No Match',
        last_changed_date: now,
      };
    });
  }

  private async extractLocation(form, client) {
    const missing = [];
    ['location_code', 'scan_date', 'user', 'scanner', 'is_set'].forEach(field => {
      if (_.has(form, field)) {
        return;
      }
      missing.push(field);
    });
    if (!_.isEmpty(missing)) {
      throw new Error(`Upload audit form is missing ${_.join(missing, ',')}`);
    }
    const locationRecord = {
      received_date: DateTime.utc().toJSDate(),
      location_code: form[uploadHeaders.locationField],
      scan_date: form[uploadHeaders.scanDateField] ?
        DateTime.fromFormat(form[uploadHeaders.scanDateField], tracDateFormat).toUTC().toJSDate() :
        null,
      close_date: null,
      status: form[uploadHeaders.isSetField] === 'AUDIT' ? 'OPEN' : 'CHECKIN',
      auditor: form[uploadHeaders.userField],
      scanner: form[uploadHeaders.scannerField],
    }
    const sql = `SELECT * FROM ${this.schemaName}.${this.auditTableName}
WHERE location_code='${form[uploadHeaders.locationField]}'`;
    const audits = await client.query(sql)
      .catch(err => {
        throw new Error(`Query '${sql}' because ${err.message}`)
      });
    const found = _.find(audits.rows, a => {
      // console.log(`checking audit ${dump(a)}`);
      return a.scan_date === locationRecord.scan_date;
    });
    if (!_.isEmpty(found)) {
      throw Error(`Audit for location code ${locationRecord.location_code}
      scanned on ${locationRecord.scan_date} is already in trac`);
    }
    return {
      location: locationRecord,
      items: [],
      notes: [],
    };
  }
}
