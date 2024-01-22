import {PostgresClient, tryCatch} from "@trac/postgresql";
import {getDataFields, NullableString} from "@trac/datatypes";
import {StatusCodes} from "http-status-codes";
import _ from "lodash";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class GetAndUpdateProducts2 {
  private getProductsSql: string;
  private updateSql: string;
  constructor(private postgresConfig, private tableName) {
    this.getProductsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${tableName}`;
    this.updateSql = `UPDATE ${postgresConfig.getSchemaName()}.${tableName} SET `;
    
  }
  public getProducts(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      const uuid = req.params[getDataFields.uuid] || null;
      const client = await postgresClient.getClient()
      const results = await this.queryProducts(client, uuid)
        .finally(async () => {
          console.log('trying to disconnect consignment')
          return postgresClient.release(client);
        });
      res.json(results.rows);
      //console.table(results.rows)
    })
  }
  public update(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const uuids = req.body[getDataFields.items];
      const price = req.body[getDataFields.price];
      const excluded = req.body[getDataFields.flag];
      const client = await postgresClient.getClient();
      if(price) {
        await this.updateProducts({uuids, price, client})
          .finally(() => {
            postgresClient.release(client);
          });
      }
      if(_.isBoolean(excluded)) {
        await this.updateProducts({uuids, excluded, client})
          .finally(() => {
            postgresClient.release(client);
          });
      }
      res.status(StatusCodes.OK);
      res.send('OK (_for development_)')
      
    })
  }
  async queryProducts(client, uuid = null as NullableString) {
    let sql = this.getProductsSql;
    if(uuid) {
      sql += ` WHERE uuid='${uuid}'`;
    }
    sql +=';';
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }
  async updateProducts({uuids, price = null, excluded = null, client}) {
    console.log(`update products ${dump(uuids)} for ${price} or ${excluded}`);
    let sql = this.updateSql;
    if(price) {
      sql += `unit_price = '${price}'`;
    }
    if(_.isBoolean(excluded)) {
      sql += `excluded = ${excluded}`;
    }
    if(uuids.length > 1) {
      sql += ` WHERE uuid IN (${_.join(_.map(uuids, u => `'${u}'`), ',')});`
    } else {
      sql += ` WHERE uuid='${uuids[0]}';`
    }
    console.log(`sql for update Item ${sql}`);
    return client.query(sql)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
}






