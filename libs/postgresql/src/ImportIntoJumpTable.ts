import _ from "lodash";
import BulkSqlWithCreate from "./BulkSqlWithCreate";
import {salesJumpDataMapping, SalesRepRecord, salesRoles} from "../../datatypes/src";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

interface MapEntriesForSalesRep {
  territory: string;
  name: string;
  role: string;
  customer: string;
}
export default class ImportIntoJumpTable {
  private fillTable: BulkSqlWithCreate;
  private getAllMappingsSql: string;
  private getSalesRepsSql: string;
  private salesRepMap: {[id: string]: MapEntriesForSalesRep[]};
  private removeTableSql: string;

  constructor(private schemaName, private tableName, private salesRepTable, private salesMappingTable) {
    this.fillTable = new BulkSqlWithCreate(schemaName, tableName, salesJumpDataMapping);
    this.removeTableSql = `DROP TABLE ${schemaName}.${this.tableName}`;
    this.getAllMappingsSql = `SELECT * FROM ${schemaName}.${salesMappingTable};`;
    this.getSalesRepsSql = `SELECT * FROM ${schemaName}.${salesRepTable} WHERE concat_ws(' ', first_name, last_name)
IN (`;
    this.salesRepMap = {};
  }
  public removeTable(client) {
    return client.query(this.removeTableSql).catch(err => {
      throw new Error(`Mistake in '${this.removeTableSql}' caused ${err.message}`);
    });
  }
  public async fill(client) {
    const salesReps: SalesRepRecord[] = await this.getSalesReps(client);
    console.log(`getting sale reps ${salesReps.length}`);
    // console.log(`getting sale reps ${dump(_.slice(salesReps,0,15))}`);
    const data = [];
    _.forEach(salesReps, sr => {
      // console.log(`filling record ${dump(sr)}
      // using ${sr.first_name} ${sr.last_name} ${dump(this.salesRepMap[`${sr.first_name} ${sr.last_name}`])}`);
      data.push(...this.fillRecords(sr));
      // console.log(`fill record ${dump(this.fillRecords(sr))}`);
    });
    // console.log(`creating table ${dump(data)}`);
    await this.fillTable.createTable(client);
    console.log(`storing data`)
    return this.fillTable.fill(data, client, 50);
  }
  private fillRecords(salesRep) {
      return _.map(this.salesRepMap[`${salesRep.first_name} ${salesRep.last_name}`],
          m => {
            // console.log(`filling jump table ${dump(result)}`);
            // console.log(`from salesrep ${dump(salesRep)}`);
            // console.log(`and map ${dump(m)}`);
            return {
              customer_id: m.customer,
              salesrep_id: salesRep.salesrep_id,
              salesrep_uuid: salesRep.uuid,
              role: m.role,
              territory: m.territory,
            };
          });
  }
  private async getSalesReps(client) {
    // console.log('creating maps');
    await this.createNameMap(client);
    // console.log('maps are done');
    let sql = this.getSalesRepsSql;
    sql += _.join(_.map(_.keys(this.salesRepMap), sr => `'${sr}'`), ',\n');
    sql += ');';
    // console.log(`sql sales jump sql ${sql}`);
    return client.query(sql)
      .then(data => data.rows)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
  private async createNameMap(client) {
    return client.query(this.getAllMappingsSql)
      .then(data => {
        _.forEach(data.rows, r => this.saveMapping(r));
        // console.log('maps are saved');
        return;
      })
      .catch(err => {
        throw new Error(`Mistake in '${this.getAllMappingsSql}' caused ${err.message}`);
      });
  }
  private saveMapping(record) {
    // console.log(`storing mapping ${dump(record)}`);
    _.forEach(salesRoles, (sr, role) => {
      // console.log(`processing ${record.customer_ship_to} for ${sr.sqlNameField}`);
      if(record[sr.sqlTerritoryField]) {
        const [name, territory, customer] = [record[sr.sqlNameField], record[sr.sqlTerritoryField],
          record.customer_ship_to];
        // console.log(`extracted name ${name} territory ${territory} role ${role} customer ${customer}`)
        const maps = this.salesRepMap[name] || [];
        maps.push({name, territory, role, customer});
        // console.log('after push');
        this.salesRepMap[name] = maps;
        // console.log('after maps');
        // console.log(`map for ${name} ${dump(maps)}`);
      }
    });
    // console.log(`done with ${record.customer_ship_to}`);
  }
}
