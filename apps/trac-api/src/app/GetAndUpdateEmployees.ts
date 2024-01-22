import {PostgresClient, tryCatch} from "@trac/postgresql";
import {getDataFields, NullableString} from "@trac/datatypes";
import {StatusCodes} from "http-status-codes";
import _ from "lodash";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class GetAndUpdateEmployees {
  private getEmployeesSql: string;
  private updateSql: string;
  constructor(private postgresConfig, private tableName) {
    this.getEmployeesSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${tableName}`;
    this.updateSql = `UPDATE ${postgresConfig.getSchemaName()}.${tableName} SET `;
    
  }
  public getEmployees(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      const uuid = req.params[getDataFields.uuid] || null;
      const client = await postgresClient.getClient()
      const results = await this.queryEmployees(client, uuid)
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
      const uuids = req.body[getDataFields.employeename];
    //   const price = req.body[getDataFields.price];
      const excluded = req.body[getDataFields.flag];
      const client = await postgresClient.getClient();
    //   if(price) {
    //     await this.updateEmployees({uuids, name, client})
    //       .finally(() => {
    //         postgresClient.release(client);
    //       });
    //   }
      if(_.isBoolean(excluded)) {
        await this.updateEmployees({uuids, excluded, client})
          .finally(() => {
            postgresClient.release(client);
          });
      }
      res.status(StatusCodes.OK);
      res.send('OK (_for development_)')
      
    })
  }
  async queryEmployees(client, uuid = null as NullableString) {
    let sql = this.getEmployeesSql;
    if(uuid) {
      sql += ` WHERE uuid='${uuid}'`;
    }
    sql +=';';
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }
  async updateEmployees({uuids, name = null, excluded = null, client}) {
    console.log(`update employees ${dump(uuids)} for ${name} or ${excluded}`);
    let sql = this.updateSql;
    if(name) {
      sql += `emp_name = '${name}'`;
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






