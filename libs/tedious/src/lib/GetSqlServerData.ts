import _ from "lodash";
import TediousConfigFactory from "./TediousConfigFactory";
import {TediousTables} from "./tedious";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const builtInIds = {
  customers: [
    '01001710',
    '01001790',
    '01001827',
    '01001930',
    '01001992',
    '01002070',
    '01002096',
    '01002135',
    '01002140',
    '01002141',
    '01002209',
    '01002268',
    '01234900',
    '01234912',
    '01234927',
    '01234936',
    '01234947',
    '01234973',
    '01234993',
    '01234996',
    '01235008',
    '01235020',
    '01235034',
    '01235037',
    '01235077',
    '01235088',
  ],
  products: [
    'AO2UV-2200',
    'AO2UV-2250',
    'AO2UV-2300',
    'AO2UV-2350',
    'AO2UV-2400',
    'E3050 7.00',
    'E3050 7.25',
    'E3050 7.50',
    'E3050 7.75',
    'E3050 8.00',
    'E3050 8.25',
    'E3050 8.50',
    'E3050 8.75',
    'E3050 9.00',
    'E3050 9.25',
    'E3050 9.50',
    'E3096 6.50',
    'E3096 6.75',
    'E3096 7.00',
    'E3096 7.25',
    'E3096 7.50',
    'E3096 7.75',
    'E3096 8.00',
    'E3096 8.25',
    'E3096 8.50',
    'E3096 8.75',
    'E3096 9.00',
    'LI61SE0100',
    'LI61SE0200',
    'LI61SE0300',
    'LI61SE0400',
    'LI61SE0500',
    'LI61SE0550',
    'LI61SE0600',
    'LI61SE0650',
    'LI61SE0700',
    'PREVUEY+11.50',
    'PREVUEY+12.00',
    'PREVUEY+12.50',
    'PREVUEY+13.00',
    'PREVUEY+13.50',
    'PREVUEY+14.00',
    'PREVUEY+14.50',
    'PREVUEY+15.00',
    'PREVUEY+15.50',
    'PREVUEY+16.00',
    'PREVUEY+16.50',
    'PREVUEY+17.00',
    'PREVUEY+17.50',
    'PREVUEY+18.00',
    'PREVUEY+18.50',
    'PREVUEY+19.00',
  ],
};

export class GetSqlServerData {

  private getSql;

  constructor(config: TediousConfigFactory) {
    this.getSql = {};

    this.getSql['customers'] = `SELECT Customer_ID, Customer_Name, DEA_Number, HIN_Number, (Address_1 + ' ' + Address_2)
AS Address, City, State, Postal, Phone FROM [${config.getDatabase()}].${config.getTablePath('customers')}
WHERE Customer_ID IN `;

    this.getSql['products'] = `SELECT Product_ID, Product_Name, Product_Level5_ID, Product_Level5_Desc, Product_Level4_ID,
Product_Level4_Desc, Product_Level3_ID, Product_Level3_Desc, Product_Level2_ID, Product_Level2_Desc
FROM [${config.getDatabase()}].${config.getTablePath('products')} WHERE Product_ID IN `;

    this.getSql['mappings'] = `SELECT  [Customer_Ship_To], [Postal], [Zip_code], [Primary_Terr], [Primary_Name],
[KAE_Terr], [KAE_Name], [Secondary_Terr], [Secondary_Name], [VRS_Terr], [VRS_Rep], [RTM_Terr], [RTM_Rep],
[COS_Terr], [COS_Name], [ATM_Terr], [ATM_Name], [ASES_Terr], [ASES_Name], [Cust_Adv_Terr], [Cust_Adv Name],
[EAS_Terr], [EAS_Name], [VS_Terr], [VS_Name], [PDS_Terr], [PDS_Name], [ENT_Terr], [ENT_Rep], [ISS_Terr], [ISS_Rep],
[SIR_Terr], [SIR_Name], [CLAE_Terr], [CLAE_Name], [Other_Terr], [Other_Desc]
FROM [${config.getDatabase()}].${config.getTablePath('mappings')} WHERE Customer_Ship_To IN `;

    this.getSql['salesReps'] = `SELECT [Sales_Rep_ID], [Business_Unit_ID], [Territory_ID], [Sales_Team_ID],
[Territory_Code], [Region_Code], [Area_Code], [Sales_Rep_Employee_ID], [Sales_Rep_First_Name], [Sales_Rep_Last_Name],
[Sales_Rep_Title], [Sales_Rep_User_ID], [Sales_Rep_Email], [Active_Ind]
  FROM [${config.getDatabase()}].${config.getTablePath('salesReps')}`;
  }

  public async getTableData(request, tableType: TediousTables, tediousClient, ids = null) {
    if(ids === null) {
      switch(tableType) {
        case "customers":
        case "mappings":
          ids = builtInIds.customers;
          break;
        case "products":
          ids = builtInIds.products;
          break;
        case "salesReps":
      }
    }
    return this.getDataQuery(request, tableType, ids, tediousClient)
      .then(results => {
        // console.log(`Got results from SQL server ${dump(results)}`)
        return results.recordset;
      });
  }

  private getDataQuery(request, tableName, ids, tediousClient) {
    let sql = this.getSql[tableName]
    if(_.isArray(ids)) {
      sql +=  ` (${_.join(_.map(ids, i => `'${i}'`), ', ')});`;
    }
    // console.log(`Data query '${sql}'`)
    return request.query(sql)
      .catch(err => tediousClient.throwError(`Get ${tableName} Data ${sql}`, err, request));
  }
}
