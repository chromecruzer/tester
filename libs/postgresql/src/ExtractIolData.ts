import _ from "lodash";
import util from "util";
import PostgresConfigFactory from "./PostgresConfigFactory";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class ExtractIolData {
  private getUniqueCustomerCodesSql: string;
  private getUniqueProductsSql: string;

  constructor(private postgresConfigFactory: PostgresConfigFactory, private iolTable: string) {
    this.getUniqueCustomerCodesSql = `SELECT DISTINCT name_code
FROM ${postgresConfigFactory.getSchemaName()}.${iolTable};`;
    this.getUniqueProductsSql = `SELECT DISTINCT item, description
FROM ${postgresConfigFactory.getSchemaName()}.${iolTable};`;
  }

  public async getUniqueCustomerCodes(client) {
    const sql = this.getUniqueCustomerCodesSql;
    return client.query(sql)
      .then(response => {
        return _.sortBy(_.map(response.rows, r => r.name_code));
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }

  public async getUniqueProducts(client) {
    const sql = this.getUniqueProductsSql;
    return client.query(sql)
      .then(response => {
        // console.log(`rows length ${response.rows.length}`)
        // _.forEach(response.rows, (r, i) => console.log(`row ${i} ${r.item}`));
        // console.log(`sorted rows ${_.sortBy(_.map(response.rows, r => r.item)).length}`)
        return _.sortBy(_.map(response.rows, r => r.item));
        // return _.map(response.rows, r => `${r.item}and${r.description}`);
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
}
