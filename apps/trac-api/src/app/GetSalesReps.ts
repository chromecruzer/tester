import {PostgresClient, PostgresConfigFactory, queryRecords, tryCatch} from "@trac/postgresql";
import {getDataFields} from "@trac/datatypes";
import _ from "lodash";
import * as util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class GetSalesReps {
  private getSalesRepsSql: string;
  private getMappingsSql: string;
  constructor(private postgresConfig: PostgresConfigFactory, salesJumpTable: string, salesRepTable: string) {
    this.getSalesRepsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${salesRepTable}`;
    this.getMappingsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${salesJumpTable}`;
  }
  public getSalesReps(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const id = req.params[getDataFields.salesrepId] || null;
      const uuid = req.params[getDataFields.uuid] || null;
        const client = await postgresClient.getClient()
        const results = await queryRecords(client, this.getSalesRepsSql, 'salesrep_id',
          {uuid, id})
          .finally(async () => {
            console.log('trying to disconnect sales rep')
            return postgresClient.release(client);
          });
        res.json(results);
    })
  }
  public getSalesRepsForRole(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const role = req.params[getDataFields.role] || null;
        const client = await postgresClient.getClient()
        const mappings = await this.getMappingsForCustomer(client, role);
        const ids = _.uniq(_.map(mappings, m => m.salesrep_id));
        const salesreps =  await queryRecords(client, this.getSalesRepsSql, 'customer_code', {ids})
          .finally(async () => {
            console.log('trying to disconnect sales rep')
            return postgresClient.release(client);
          });
        res.json(_.map(salesreps, sr => ({...sr, role})));
    })
  }
  public getSalesRepsForCustomer(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      // console.log(`mappings for req ${dump(req)} is ${dump(req.params)}`)
      const customerId = req.params[getDataFields.customerId] || null;
      const client = await postgresClient.getClient();
        const mappings = await this.getMappingsForCustomer(client, customerId);
        if(_.isEmpty(mappings)) {
          console.error(`mappings missing for customer ${customerId}`)
          res.json([]);
          return postgresClient.release(client);
        }
        const srMap = _.reduce(mappings, (accum, m) => {
          accum[m.salesrep_id] = m
          return accum;
        }, {});
        // console.log(`mapping salesreps to roles ${dump(srMap)}`)
        const salesreps = await queryRecords(client, this.getSalesRepsSql, 'salesrep_id',
          {ids:_.keys(srMap)})
          .finally(async () => {
          console.log('trying to disconnect sales rep')
          return postgresClient.release(client);
        });
        const results = _.map(salesreps, sr => ({...sr, role: srMap[sr.salesrep_id].role}));
        res.json(results);
    })
  }
  public getCustomersForSalesRep(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const id = req.params[getDataFields.salesrepId] || null;
      const uuid = req.params[getDataFields.uuid] || null;
      const client = await postgresClient.getClient();
        const mappings = await this.getMappingsForSalesRep(client, id, uuid);
        const ids = _.map(mappings, m => m.customer_id);
        const results =  await queryRecords(client, this.getSalesRepsSql, 'customer_code', {ids})
          .finally(async () => {
            console.log('trying to disconnect sales rep')
            return postgresClient.release(client);
          });
        res.json(results);
    })
  }
  private getMappingsForSalesRep(client, salesrepId = null, uuid = null) {
    let sql = this.getMappingsSql;
    if(salesrepId) {
      sql += ` WHERE salesrep_id = '${salesrepId}';`;
    }
    if(uuid) {
      sql += ` WHERE salesrep_uuid = '${uuid}';`;
    }
    return client.query(sql)
      .then(data => data.rows)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
  private getMappingsForCustomer(client, customerId) {
    let sql = this.getMappingsSql;
    sql += ` WHERE customer_id = '${customerId}';`;
    return client.query(sql)
      .then(data => data.rows)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
  private getMappingsForRole(client, role) {
    let sql = this.getMappingsSql;
    sql += ` WHERE role = '${role}';`;
    return client.query(sql)
      .then(data => data.rows)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
}
