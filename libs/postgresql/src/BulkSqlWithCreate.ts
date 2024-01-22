import {appendBulkData, appendUuids, datumToSql} from "./postgresql";
import * as _ from 'lodash';
import {InputToSqlMapping} from "../../datatypes/src";
import * as util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class BulkSqlWithCreate {
  private readonly createSchemaSql;
  private readonly createTableSql;
  private readonly bulkInsertSql;
  private readonly bulkDeleteSql;

  constructor(
    private schemaName: string,
    private tableName: string,
    private mappings: InputToSqlMapping[],
    private addUuid = true,
    private hasUuid = false
  ) {
    this.createSchemaSql = `CREATE SCHEMA ${schemaName};`;
    this.createTableSql = `CREATE TABLE ${schemaName}.${tableName}`;
    this.bulkInsertSql = `INSERT INTO ${schemaName}.${tableName} VALUES`;
    this.bulkDeleteSql = `DELETE from ${schemaName}.${tableName} WHERE uuid IN (`;
  }

  public createSchema(client) {
    return client.query(this.createSchemaSql);
  }

  public createTable(client) {
    const sql = this.appendTableColumns(this.createTableSql);
    // console.log(`creating table with '${sql}'`);
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }

  private detectUuidCreep(data) {
    const uuidRegex = /[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+/;
    // console.log(`${this.addUuid ? 'detecting' : 'ignoring'}  uuid creep on ${data[0][0]}`);
    if (this.addUuid && uuidRegex.test(data[0][0])) {
      throw new Error(`UUID creep detected on ${dump(data[0])}`);
    }
  }

  public async fill(data, client, chunkSize = 0) {
    // this.detectUuidCreep(data);
    let chunks = [data];
    if (chunkSize) {
      chunks = _.chunk(data, chunkSize);
    }
    // console.log(`filling ${chunks.length} chunks`);
    return Promise.all(chunks.map((chunk, index) => {
      const sql = appendBulkData(
        this.bulkInsertSql,
        chunk,
        this.mappings,
        this.addUuid,
        this.hasUuid,
      );
      // console.log(`chunk ${dump(chunk)}`);
      // console.log(`filling ${index} out of ${chunks.length}`);
      // console.log('bulk fill sql', sql);
      return client.query(sql).catch(err => {
        // console.error(`SQL Error ${dump(err)}`);
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
    }));
  }

  public delete(uuids, client) {
    const sql = appendUuids(this.bulkDeleteSql, uuids);
    // console.log('bulk delete sql ', sql);
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }

  private appendTableColumns(sql) {
    let result = sql;
    let skipped1st = false;
    if (this.addUuid) {
      skipped1st = true;
      result += BulkSqlWithCreate.appendUuidColumn();
    }
    this.mappings.forEach(c => {
      result += `${skipped1st ? ',' : ''}\n${c.sqlLabel} ${c.sqlType}`;
      skipped1st = true;
    });
    result += '\n);';
    return result;
  }

  private static appendUuidColumn() {
    return ' (\nuuid UUID unique';
  }
}
