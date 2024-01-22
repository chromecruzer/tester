import {BulkTediousWithCreate, TediousConfigFactory, TediousQuery, TediousTables} from "@trac/tedious";
import {LoadXlsxData} from "@trac/postgresql";
import {mssqlMappings} from "./SqlMappings";
import _ from "lodash";

export default class PutSqlServerData {
  private getAllSql: string;
  private dbCreateSql: string;
  constructor(public config: TediousConfigFactory, private tableType: TediousTables) {
    this.getAllSql = `SELECT * FROM [${config.getDatabase()}].${config.getTablePath(tableType)};`;
  }
  public async insert(request, spreadSheetFileName) {
    console.log(`Importing ${spreadSheetFileName}`)
    const spreadSheet = new LoadXlsxData();
    await spreadSheet.readWithMap(spreadSheetFileName, mssqlMappings[this.tableType]);
    if(this.tableType === 'customers') {
      spreadSheet.bulkData = _.map(spreadSheet.bulkData, r => {
        return [..._.slice(r, 0,5), 'address 2', ..._.slice(r,5)];
      });
      spreadSheet.headers = [..._.slice(spreadSheet.headers, 0, 5),
        'Address_2',..._.slice(spreadSheet.headers, 5)]
      console.log(`added address 2 ${spreadSheet.headers}`);
    }
    console.log('loaded xlsx data');
    const bulkFill = new BulkTediousWithCreate(this.config.getTablePath(this.tableType));
    await bulkFill.createAndFill(spreadSheet, request)
    console.log(`created and filled ${bulkFill.tableName}`);
  }
  public async exists(request) {
    const tquery = new TediousQuery(request)
    return tquery.query(this.getAllSql)
      .then(() => true)
      .catch(() => false);
  }
}
