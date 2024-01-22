import {PostgresClient, PostgresConfigFactory, queryRecords, SearchTable, tryCatch} from "@trac/postgresql";
import {getDataFields} from "@trac/datatypes";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class GetData {
  searchTable: SearchTable;
  getConsignmentsSql: string;
  getCustomersSql: string;
  private getCustomerContactsSql: string;
  private getSalesMappingsSql: string;
  constructor(private postgresConfig: PostgresConfigFactory, consignmentTable: string, customersTable: string,
              customerContactTable: string, salesMappingsTable: string) {
    this.searchTable = new SearchTable(postgresConfig.getSchemaName());
    this.getCustomersSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${customersTable}`;
    this.getCustomerContactsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${customerContactTable}`;
    this.getSalesMappingsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${salesMappingsTable}`;
    this.getConsignmentsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${consignmentTable}`;
  }

  public search(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const text = req.body[getDataFields.searchText];
      const filters = req.body[getDataFields.filters];
        const client = await postgresClient.getClient()
        const results = await this.searchTable.search(text, filters, client)
          .finally(async () => {
            return postgresClient.release(client);
          });
        // console.log(`search results ${dump(this.searchTable.uniquify(results))}`)
        res.json(this.searchTable.uniquify(results));
    })
  }
  public getConsignments(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
        const customerId = req.params[getDataFields.customerId] || null;
        const client = await postgresClient.getClient()
        const results = await this.queryConsignments(client, customerId)
          .finally(async () => {
            console.log('trying to disconnect consignment')
            return postgresClient.release(client);
          });
        res.json(results.rows);
    })
  }
  public async queryConsignments(client, customerId: (string | null) = null) {
    let sql = this.getConsignmentsSql;
    if(customerId) {
      sql += ` WHERE customer_id='${customerId}'`;
    }
    sql +=';';
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }
  public getCustomers(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      const uuid = req.params[getDataFields.uuid] || null;
      const customerId = req.params[getDataFields.customerId] || null;
        const client = await postgresClient.getClient()
        const results = await queryRecords(client, this.getCustomersSql, 'customer_code',
          {uuid, id: customerId})
          .finally(async () => {
            console.log('trying to disconnect customer')
            return postgresClient.release(client);
          });
        res.json(results);
    })
  }
  public getCustomerContacts(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      const uuid = req.params[getDataFields.uuid] || null;
      const customerId = req.params[getDataFields.customerId] || null;
      const client = await postgresClient.getClient()
      const results = await queryRecords(client, this.getCustomerContactsSql, 'ship_to_id',
        {uuid, id: customerId})
        .finally(async () => {
          console.log('trying to disconnect customer contacts')
          return postgresClient.release(client);
        });
      res.json(results);
    })
  }

  public getSalesMappings(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      const uuid = req.params[getDataFields.uuid] || null;
      const customerId = req.params[getDataFields.customerId] || null;
      const client = await postgresClient.getClient()
      const results = await queryRecords(client, this.getSalesMappingsSql, 'customer_ship_to',
        {uuid, id: customerId})
        .finally(async () => {
          console.log('trying to disconnect customer contacts')
          return postgresClient.release(client);
        });
      res.json(results);
    })
  }
}
