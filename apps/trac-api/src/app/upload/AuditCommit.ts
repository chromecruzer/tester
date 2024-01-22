import {UploadCommitA} from "./UploadCommitA";
import UploadStoreManagement from "../datastore/UploadStoreManagement";
import {datumToSql} from "@trac/postgresql";
import util from "util";
import _ from "lodash";
import {AuditMatch, AuditRecord, auditRecordFromJson} from "@trac/datatypes";
//need to keep this for errors
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class AuditCommit extends UploadCommitA {
  private insertLocationSql: string;
  private insertLocationSqlSuffix: string;
  private insertItemsSql: string;
  private insertItemsSqlSuffix: string;
  private insertNotesSql: string;
  private record: AuditRecord;

  constructor(dataStore: UploadStoreManagement, schemaName: string,
              auditTableName: string, itemsTableName: string, notesTableName: string) {
    super(dataStore, schemaName);
    // console.log('constructor start');
    this.insertLocationSql = `INSERT INTO ${schemaName}.${auditTableName} VALUES (
gen_random_uuid(), `;
    this.insertLocationSqlSuffix = `) RETURNING uuid;`;
    this.insertItemsSql = `INSERT INTO ${schemaName}.${itemsTableName} VALUES `;
    this.insertItemsSqlSuffix = ` RETURNING lot, uuid;`;
    this.insertNotesSql = `INSERT INTO ${schemaName}.${notesTableName} VALUES `;
    // console.log('constructor stop');
  }

  public getArchiveData() {
    return this.record;
  }

  public async commit(token, client) {
    // console.log('commit start');
    this.record = auditRecordFromJson(await this.dataStore.retrieve(token));
    const location = await this.commitLocation(this.record.location, client);
    return this.commitItems(this.record.items, location, client)
      .then(result => {
        // console.log('commit stop');
        return result;
      });
  }

  private async commitLocation(location, client) {
    // console.log(`commit location ${dump(location)} ${datumToSql(location.scan_date, 'date')}`);
    const sql = `${this.insertLocationSql}
    ${datumToSql(location.received_date, 'date')},
    ${datumToSql(location.location_code, 'string')},
    ${datumToSql(location.scan_date, 'date')},
    null,
    ${datumToSql(location.status, 'string')},
    ${datumToSql(location.auditor, 'string')},
    ${datumToSql(location.scanner, 'string')}
    ${this.insertLocationSqlSuffix}`;
    return client.query(sql)
      .then(result => {
        location.uuid = result.rows[0].uuid;
        // console.log(`commit location stop rows ${dump(result.rows)} uuid ${result.rows[0].uuid}
        //  location ${dump(location)}`);
        return location;
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }

  private async commitItems(items, location, client) {
    // console.log(`commit items start location ${dump(location)}`);
    const values = _.map(items, i => {
      return `(
    gen_random_uuid(),
    ${datumToSql(i.lot, 'string')},
    ${datumToSql(i.consignment_uuid, 'string')},
    ${datumToSql(i.consignment_location, 'string')},
    ${datumToSql(i.consignment_warehouse, 'string')},
    ${datumToSql(i.item, 'string')},
    ${datumToSql(i.family, 'string')},
    ${datumToSql(i.description, 'string')},
    ${datumToSql(i.expire_date, 'date')},
    ${datumToSql(i.audit_match, 'string')},
    ${datumToSql(location.uuid, 'string')},
    ${datumToSql(i.quantity, 'number')},
    ${datumToSql(i.last_changed_date, 'date')},
    ${datumToSql(i.confirmed_date, 'date')},
    ${datumToSql(i.confirmed_by, 'string')}
    )`;
    });
    const sql = `${this.insertItemsSql}
    ${_.join(values, ',\n')}
    ${this.insertItemsSqlSuffix}`;
    // console.log(`assembled sql ${sql}`);
    return client.query(sql)
      .then(result => {
        result.rows.forEach(r => {
          const found = _.find(items, i => i.lot === r.lot);
          if (!found) {
            return Promise.reject(new Error(`${dump(result)} not found in ${dump(items)}`));
          }
          found.uuid = r.uuid;
        });
        // console.log('commit items stop');
        return result;
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
}
