import {tryCatch} from "@trac/postgresql";
import {getDataFields} from "@trac/datatypes";
import {GetSqlServerData, TediousConfigFactory} from "@trac/tedious";

export default class GetSqlServerDataHttps extends GetSqlServerData {
  constructor(config: TediousConfigFactory) {
    super(config);
  }
  getCustomerData(mssqlClient) {
    return tryCatch(async (req, res, next) => {
      const client = await mssqlClient.getClient();
      const itemUuids = req.body[getDataFields.items];
      const results =  await this.getTableData(client, 'customers', itemUuids)
        .finally(async () => {
          console.log('trying to disconnect sql server customers table')
          return mssqlClient.release(client);
        });
      res.json(results);
    })
  }
  getProductData(mssqlClient) {
    return tryCatch(async (req, res, next) => {
      const client = await mssqlClient.getClient();
      const itemUuids = req.body[getDataFields.items];
      const results =  await this.getTableData(client, 'products',itemUuids)
        .finally(async () => {
          console.log('trying to disconnect sql server products table')
          return mssqlClient.release(client);
        });
      res.json(results);
    })
  }
  getSalesMappingData(mssqlClient) {
    return tryCatch(async (req, res, next) => {
      const client = await mssqlClient.getClient();
      const itemUuids = req.body[getDataFields.items];
      const results =  await this.getTableData(client, 'mappings',itemUuids)
        .finally(async () => {
          console.log('trying to disconnect sql server sales mappings table')
          return mssqlClient.release(client);
        });
      res.json(results);
    })
  }
  getSalesRepData(mssqlClient) {
    return tryCatch(async (req, res, next) => {
      const client = await mssqlClient.getClient();
      const results =  await this.getTableData(client, 'salesReps', mssqlClient)
        .finally(async () => {
          console.log('trying to disconnect sql server sales reps table')
          return mssqlClient.release(client);
        });
      res.json(results);
    })
  }
}
