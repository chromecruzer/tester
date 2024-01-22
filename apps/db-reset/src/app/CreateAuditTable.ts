import _ from 'lodash';
import {PoolClient} from "pg";

export default class CreateAuditTable {
  private createSchemaSql: string;
  private createTableSql: string;
  constructor(
    private schemaName,
  ) {
    this.createSchemaSql = `CREATE SCHEMA ${schemaName};`;
    this.createTableSql = `CREATE TABLE ${schemaName}`;
  }
  public async createSchema(client) {
    return client.query(this.createSchemaSql);
  }
  public async create(client: PoolClient, tableName: string, initialRecord: {[id: string]: string}) {
    const sql = this.appendTableColumns(`${this.createTableSql}.${tableName} (\n`, initialRecord);
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }
  private appendTableColumns(sql, initialRecord) {
    let result = sql;
    let skipped1st = false;
    _.forEach(initialRecord, (t, n) => {
      result += `${skipped1st ? ',' : ''}\n${n} ${t}`;
      skipped1st = true;
    });
    result += '\n);';
    return result;
  }
}
