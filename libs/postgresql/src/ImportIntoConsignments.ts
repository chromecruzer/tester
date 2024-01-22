import {SearchTable} from "./index";

export default class ImportIntoConsignments {
  private insertIntoConsignmentsSql;
  private search: SearchTable;
  private removeTableSql: string;
  private deleteExcludedSql: string;

  constructor(private schemaName, private tableName, iolTableName, productTableName) {
    this.insertIntoConsignmentsSql = `SELECT DISTINCT ON(uuid) iol.uuid AS uuid, iol.item AS item,
    iol.description AS description, iol.lot AS lot, iol.quantity AS quantity, iol.expire_date AS expire_date,
    prod.product_id_level3 AS product_id, iol.name_code AS customer_id, iol.location_code AS warehouse,
    prod.uuid AS prod_uuid, prod.description_level4 AS description4, prod.description_level5 AS description5,
    prod.unit_price AS unit_price, prod.excluded AS excluded
    INTO ${schemaName}.${tableName} FROM ${schemaName}.${iolTableName} AS iol JOIN ${schemaName}.${productTableName}
    AS prod ON iol.description = prod.description WHERE prod.excluded = false`;
    this.removeTableSql = `DROP TABLE ${schemaName}.${this.tableName}`;
    this.deleteExcludedSql = `DELETE from ${schemaName}.${this.tableName} WHERE excluded = true`;
    this.search = new SearchTable(schemaName);
  }
  public async into(client) {
    const sql = this.insertIntoConsignmentsSql;
    // console.log(`consignments sql ${sql}`);
    return client.query(sql)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
  public async removeExcluded(client) {
    const sql = this.deleteExcludedSql;
    // console.log(`exclude consignments sql ${sql}`);
    return client.query(sql)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
  public async removeTable(client) {
    return client.query(this.removeTableSql).catch(err => {
      throw new Error(`Mistake in '${this.removeTableSql}' caused ${err.message}`);
    });
  }

  static addWhereClause(sql, products) {
    let result = `${sql}\nWHERE prod.product_id_level3 IN (`;
    let firstComma = false;
    products.forEach(p => {
      result += `${firstComma ? ',' : ''} '${p}'`;
      firstComma = true;
    })
    result += ');';
    return result;
  }

  public async addToSearch(client) {
    return this.search.fillTable(this.schemaName, this.tableName, client)
      .then(() => {
        console.log(`Added Consignment search documents`);
      })
      .catch(err => {
        throw new Error(`Fill Search Consignment Data failed because ${err}`);
      });
  }
}
