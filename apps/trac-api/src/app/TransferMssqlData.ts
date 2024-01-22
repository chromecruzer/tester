import {
  customerFieldMappings,
  GetSqlServerData, mappingFieldMappings, productFieldMappings,
  remapMssqlRecord, salesRepsFieldMappings,
  TediousClient,
  TediousConfigFactory
} from "@trac/tedious";
import {ExtractIolData, PostgresClient, PostgresConfigFactory, tryCatch} from "@trac/postgresql";
import _ from "lodash";
import {dataTableNames, uploadHeaders} from "@trac/datatypes";
import {TransformData} from "./datastore/TransformData";
import RefreshData from "./RefreshData";
import {StatusCodes} from "http-status-codes";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class TransferMssqlData {
  private tediousClient: TediousClient;
  private iolExtract: ExtractIolData;
  private mssqlGet: GetSqlServerData;

  constructor(private tediousConfig: TediousConfigFactory, postgresConfig: PostgresConfigFactory,
              private salesRepTransformer: TransformData, private customerTransformer: TransformData,
              private productTransformer: TransformData, private salesMappingTransformer: TransformData,
              private refresher: RefreshData) {
    this.tediousClient = new TediousClient(tediousConfig);
    this.iolExtract = new ExtractIolData(postgresConfig, dataTableNames.iol);
    this.mssqlGet = new GetSqlServerData(tediousConfig);
  }

  public transferHttp(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const user = req.body[uploadHeaders.userField];
      let client = await postgresClient.getClient()
      await this.transfer(client, user)
        .finally(async () => {
          return postgresClient.release(client);
        });
      console.log(`refreshing data`);
      client = await postgresClient.getClient()
      await this.refresher.refresh(client, user)
        .finally(async () => {
          return postgresClient.release(client);
        });
      res.status(StatusCodes.OK);
      res.send('OK')
    })
  }

  public async transfer(pclient, user) {
    console.log('getting customer IDs');
    const customerIds = _.sortBy(await this.iolExtract.getUniqueCustomerCodes(pclient));
    console.log('getting product IDs');
    const productIds = _.sortBy(await this.iolExtract.getUniqueProducts(pclient));
    console.log(`found ${customerIds.length} customer ids and ${productIds.length} product ids`)
    console.log(`transferring sales reps`);
    let request = await this.tediousClient.getRequest();
    await this.transferSalesReps(request, pclient);
    await this.tediousClient.release(request);
    console.log(`transferring customers`);
    request = await this.tediousClient.getRequest();
    await this.transferCustomers(customerIds, request, pclient);
    await this.tediousClient.release(request);
    console.log(`transferring sales mappings`);
    request = await this.tediousClient.getRequest();
    await this.transferSalesMappings(customerIds, request, pclient);
    await this.tediousClient.release(request);
    console.log(`transferring products`);
    request = await this.tediousClient.getRequest();
    await this.transferProducts(productIds, request, pclient);
    await this.tediousClient.release(request);
    return this.tediousClient.disconnect();
  }

  private async transferCustomers(customerIds, request, postgresClient) {
    console.log('getting customers from SQL Server');
    const customers = await this.mssqlGet.getTableData(request, 'customers', this.tediousClient, customerIds);
    console.log(`transforming ${customers.length} customers`);
    const comparisons = await this.customerTransformer.transform(_.map(customers, c => remapMssqlRecord(c,
      customerFieldMappings)), postgresClient);
    console.log(`storing ${comparisons.adds.length} new customers and ${comparisons.exists.length} existing customers`)
    return this.customerTransformer.storeInDb(comparisons, postgresClient);
  }

  private async transferProducts(productIds, request, postgresClient) {
    console.log('getting products from SQL Server');
    const products = await this.mssqlGet.getTableData(request, 'products', this.tediousClient, productIds);
    console.log(`transforming ${products.length} products`);
    const reformatted = _.map(products, s => ({...remapMssqlRecord(s, productFieldMappings), unit_price: 1.00, excluded: false}));
    // console.log(`reformatted products ${dump(reformatted)}`);
    const comparisons = await this.productTransformer.transform(reformatted, postgresClient);
    console.log(`storing ${comparisons.adds.length} new products and ${comparisons.exists.length} existing products`)
    return this.productTransformer.storeInDb(comparisons, postgresClient);
  }

  private async transferSalesMappings(customerIds, request, postgresClient) {
    console.log('getting mappings from SQL Server');
    const mappings = await this.mssqlGet.getTableData(request, 'mappings', this.tediousClient, customerIds);
    console.log(`transforming ${mappings.length} mappings`);
    const comparisons = await this.salesMappingTransformer.transform(_.map(mappings, s => remapMssqlRecord(s,
      mappingFieldMappings)), postgresClient);
    console.log(`storing ${comparisons.adds.length} new mappings and ${comparisons.exists.length} existing mappings`)
    return this.salesMappingTransformer.storeInDb(comparisons, postgresClient);
  }

  private async transferSalesReps(request, postgresClient) {
    console.log('getting salesReps from SQL Server');
    const salesReps = await this.mssqlGet.getTableData(request, 'salesReps', this.tediousClient);
    console.log(`transforming ${salesReps.length} salesReps`);
    const comparisons = await this.salesRepTransformer.transform(_.map(salesReps, s => remapMssqlRecord(s,
      salesRepsFieldMappings)), postgresClient);
    console.log(`storing ${comparisons.adds.length} new salesReps and ${comparisons.exists.length} existing salesReps`)
    return this.salesRepTransformer.storeInDb(comparisons, postgresClient);
  }
}
