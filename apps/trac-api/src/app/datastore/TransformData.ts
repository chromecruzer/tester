import {
  Comparisons, InputDataTypeLabel, InputToSqlMapping,
  UploadRecord
} from "@trac/datatypes";
import * as _ from "lodash";
import {
  BulkSqlWithCreate,
  datumToSql,
  deepEqualFn,
  matchFieldFn,
  NotificationsServer, recordFromArray,
  transformHelpers
} from "@trac/postgresql";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export class TransformData {
  protected getNonMatchingSql: string;
  protected matchSql: string;
  protected spreadsheetMap: { [id: string]: (UploadRecord[]) };
  private bulkForNew: BulkSqlWithCreate;
  private bulkForModified: BulkSqlWithCreate;
  private emptyTableSql: string;
constructor(schemaName: string, private tableName, protected ns = null  as (NotificationsServer | null)) {
  this.getNonMatchingSql = `SELECT uuid from ${schemaName}.${tableName} WHERE uuid NOT IN (`;
  this.matchSql = `SELECT * FROM ${schemaName}.${tableName} `;
  this.bulkForNew = new BulkSqlWithCreate(schemaName, tableName, transformHelpers[tableName].mappings,
    true, false);
  this.bulkForModified = new BulkSqlWithCreate(schemaName, tableName, transformHelpers[tableName].mappings,
    false, true);
  this.emptyTableSql = `TRUNCATE ${schemaName}.${tableName}`;
  this.spreadsheetMap = {};
}
  private async createMap(updated: UploadRecord[]) {
    this.spreadsheetMap = _.reduce(updated, (accum, u: UploadRecord) => {
      const field = matchFieldFn(transformHelpers[this.tableName].matchFields, u);
      if (accum[field]) {
        (accum[field] as UploadRecord[]).push(u);
      } else {
        accum[field] = [u];// first instance
      }
      return accum;
    }, {})
  }

  public async transform(spreadsheetRecords: UploadRecord[], client) {
    this.createMap(spreadsheetRecords);
    // console.log(`match map ${dump(this.spreadsheetMap)}`)
    if(this.ns) {
      this.ns.notify('INFO', `filter existing rows`,
        `number of spreadsheet records ${spreadsheetRecords.length}`, ['iolUpload'])
    }
    console.info(`filter existing rows`);
    const potentialMatches = await this.queryMatches(client);
    const exists = _.reduce(potentialMatches, (accum, m) => this.scanForExisting(accum, m), []);
    if(this.ns) {
      this.ns.notify('INFO', `filter added records`,
        `number of potential matches ${potentialMatches.length}`, ['iolUpload'])
    }
    console.info('filter added records');
    // if(potentialMatches[0].product_id) {
    //   console.log(`potential matches ${dump(potentialMatches)}`)
    // }
    const adds = _.reduce(this.spreadsheetMap, (accum, value, key) => {
      // console.log(`adding ${key} = ${dump(value)} to adds`)
      accum.push(...value);
      return accum;
    }, [] as UploadRecord[]);
    this.spreadsheetMap = null;
    // console.log('writing adds to file');
    // fs.writeJson('addLotNumber.json', _.map(_.sortBy(adds, 'lot'), a => a['lot']));
    return {
      adds,
      exists
    } as Comparisons;
  }

  scanForExisting(accum, m) {
    const existingFn = (candidate) => {
      const preserve: any = {uuid: m.uuid};
      if (m.unit_price && m.excluded) {
        preserve.unit_price = m.unit_price
        preserve.excluded = m.excluded
      }
      if (m.last_expire_email) {
        preserve.last_expire_email = m.last_expire_email
      }
      if (m.last_audit_email) {
        preserve.last_audit_email = m.last_audit_email
      }

      // console.log(`preserving ${dump({...candidate, ...preserve})} from ${dump(m)}`)
      return {...candidate, ...preserve};
    }
    const {matchFn, compareFieldList, matchFields: fields} = transformHelpers[this.tableName];
    const candidates = this.match(m, fields, matchFn, compareFieldList);
    if (candidates?.length === 1) {
      accum.push(existingFn(candidates[0]));
      return accum;
    }
    return accum;
  }

  private match(m, matchFields, matchFn, compareFieldList): (UploadRecord[] | null) {
    const matching = matchFieldFn(matchFields, m);
    const candidates = this.spreadsheetMap[matching];
    if (!_.isArray(candidates)) {
      return null;
    }
    if (candidates.length === 1) {
      this.removeCandidate(candidates[0], matching)
      return candidates;
    }
    const better = _.filter(candidates as UploadRecord[], c => matchFn(m, c) as boolean);
    if (better.length === 1) {
      this.removeCandidate(better[0], matching)
      return better;
    }
    const results = _.filter(better, b => {
      b.uuid = m.uuid;
      return deepEqualFn(b, m, compareFieldList);
    });
    this.removeCandidate(results[0], matching);
    return [results[0]];
  }

  removeCandidate(candidate, matching) {
    const candidates = this.spreadsheetMap[matching];
    if (candidates.length === 1) {
      delete this.spreadsheetMap[matching];
      return;
    }
    this.spreadsheetMap[matching] = _.filter(candidates, c => !_.isEqual(c, candidate));
  }

  private async queryMatches(client) {
    const matchFields = transformHelpers[this.tableName].matchFields;
    const whereField = () => _.isArray(matchFields) ? `concat_ws('|', ${_.join(matchFields, ', ')})` : matchFields;
    console.info(`get matches from database`);
    let sql = `${this.matchSql}WHERE ${whereField()} IN (`;
    const inFields = _.map(_.keys(this.spreadsheetMap), u => datumToSql(u, 'string'));
    sql += _.join(inFields, ',');
    sql += ');'
    // console.log(`getting matches with sql ${sql}`);
    return client.query(sql)
      .then(data => data.rows)
      .catch(err => {
        throw new Error(`Query '${sql}' because ${err.message}`)
      });
  }
  public async storeInDb(data, client) {
    if(this.ns) {
      this.ns.notify('INFO', `remove old data`,
        `emptying ${this.emptyTableSql}`, ['iolUpload'])
    }
    console.info(`emptying ${this.emptyTableSql}`);
    await client.query(this.emptyTableSql);
    const {adds, exists: replaces} = (data as Comparisons);
    let result = Promise.resolve([]);
    if(!_.isEmpty(adds)) {
      if(this.ns) {
        this.ns.notify('INFO', `add new data`,
          `filling in ${adds.length} adds`, ['iolUpload'])
      }
      console.info(`filling in ${adds.length} adds`);
      result =  this.bulkForNew.fill(adds, client,20);
    }
    if(!_.isEmpty(replaces)) {
      if(this.ns) {
        this.ns.notify('INFO', `replace existing data`,
          `filling in ${replaces.length} replacements`, ['iolUpload'])
      }
      console.info(`filling in ${replaces.length} replacements`);
      // console.log(`filling in replacements ${dump(replaces)}`)
      result =  this.bulkForModified.fill(replaces, client,20);
    }
    return result;
  }
  public convertSpreadsheetRecords(uploadedData: InputDataTypeLabel[][], mapping: InputToSqlMapping[]) {
    if (this.ns) {
      this.ns.notify('INFO', `convert spreadsheet data`,
        `converting ${uploadedData.length} records`, ['iolUpload'])
    }
    console.info(`convert spreadsheet data`);
    return _.map(uploadedData, u => recordFromArray(u, mapping));
  }
}
