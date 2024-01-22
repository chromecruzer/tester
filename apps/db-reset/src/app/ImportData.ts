import {
  BulkSqlWithCreate,
  LoadXlsxData,
  PostgresClient,
  recordFromArray,
  SearchTable,
  transformHelpers
} from "@trac/postgresql";
import {InputToSqlMapping} from "@trac/datatypes";
import * as _ from "lodash";

export default class ImportData {
  private mapping: InputToSqlMapping[];
  constructor(private title: string,
              private schemaName,
              private postgresClient: PostgresClient,
              private tableName: string,
              private transform = t => t) {
    this.mapping = transformHelpers[tableName].mappings;
   // console.log('Charles Testing'+this.mapping);       // modified by  trkri
  }

  async import(filepath: string, chunkSize = 5000, createSchema = false, addToSearch = true) {
    console.log(`Importing ${this.title}`)
    const loadXlxs = new LoadXlsxData();
    await loadXlxs.readWithMap(filepath,this.mapping);
    console.log('loaded xlsx data');
    const fillData = new BulkSqlWithCreate(this.schemaName, this.tableName, this.mapping);
    const search = new SearchTable(this.schemaName);
    const client = await this.postgresClient.getClient();
    if (createSchema) {
      await fillData.createSchema(client)
        .catch(err => this.postgresClient.throwError('Create Schema', err, client));
      console.log('create schema');
      search.createTable(client)
        .catch(err => this.postgresClient.throwError('Create Search Table', err, client));
    }
    await fillData.createTable(client)
      .catch(err => this.postgresClient.throwError(`Create ${this.title} Table`, err, client));
    console.log(`created ${this.title} Table`);
    const transformed = this.convertSpreadsheetRecords(loadXlxs.bulkData.map(t => this.transform(t)) as []);
    await fillData.fill(transformed, client, chunkSize)
      .catch(err => this.postgresClient.throwError(`Fill ${this.title} Data`, err, client));
    if(addToSearch) {
      await search.fillTable(this.schemaName, this.tableName, client)
        .catch(err => this.postgresClient.throwError(`Fill Search ${this.title} Data`, err, client));
      console.log(`Added ${this.title} search documents`)
    }
    this.postgresClient.release(client);
  }
  private convertSpreadsheetRecords(uploadedData: []) {
    console.info(`convert spreadsheet data`);
    return _.map(uploadedData, u => recordFromArray(u, this.mapping));
  }
}
