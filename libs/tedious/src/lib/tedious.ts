import mssql from 'mssql';
import _ from "lodash";
import {UploadRecord} from "../../../datatypes/src";

export interface TediousParam {
  value?: (string | number | Date | null | string[] | number [] | Date []);
  type: mssql.sqlType;
  options: { [id: string]: string };
  name?: string;
}

export type TediousTables = ('products' | 'customers' | 'mappings' | 'salesReps')

export const productFieldMappings = {
  Product_ID: 'product_id',
  Product_Name: 'description',
  Product_Level5_ID: 'product_id_level5',
  Product_Level5_Desc: 'description_level5',
  Product_Level4_ID: 'product_id_level4',
  Product_Level4_Desc: 'description_level4',
  Product_Level3_ID: 'product_id_level3',
  Product_Level3_Desc: 'description_level3',
  Product_Level2_ID: 'product_id_level2',
  Product_Level2_Desc: 'description_level2',
}
export const customerFieldMappings = {
  Customer_ID: 'customer_code',
  Customer_Name: 'name',
  DEA_Number: 'dea_number',
  HIN_Number: 'string',
  Address: 'address',
  City: 'city',
  State: 'state',
  Postal: 'postal',
  Phone: 'phone',
}
export const mappingFieldMappings = {
  Customer_Ship_To: 'customer_ship_to',
  Postal: 'postal',
  Zip_code: 'zipcode',
  Primary_Terr: 'primary_territory',
  Primary_Name: 'primary_name',
  KAE_Terr: 'kae_territory',
  KAE_Name: 'kae_name',
  Secondary_Terr: 'secondary_territory',
  Secondary_Name: 'secondary_name',
  VRS_Terr: 'vrs_territory',
  VRS_Rep: 'vrs_name',
  RTM_Terr: 'rtm_territory',
  RTM_Rep: 'rtm_name',
  COS_Terr: 'cos_territory',
  COS_Name: 'cos_name',
  ATM_Terr: 'atm_territory',
  ATM_Name: 'atm_name',
  ASES_Terr: 'ases_territory',
  ASES_Name: 'ases_name',
  Cust_Adv_Terr: 'ases_name',
  Cust_Adv: 'cust_adv_territory',
  Name: 'cust_adv_name',
  EAS_Terr: 'eas_territory',
  EAS_Name: 'eas_name',
  VS_Terr: 'vs_territory',
  VS_Name: 'vs_name',
  PDS_Terr: 'pds_territory',
  PDS_Name: 'pds_name',
  ENT_Terr: 'ent_territory',
  ENT_Rep: 'ent_name',
  ISS_Terr: 'iss_territory',
  ISS_Rep: 'iss_name',
  SIR_Terr: 'sir_territory',
  SIR_Name: 'sir_name',
  CLAE_Terr: 'clae_territory',
  CLAE_Name: 'clae_name',
  Other_Terr: 'other_territory',
  Other_Desc: 'other_name',
}
export const salesRepsFieldMappings = {
  Sales_Rep_ID: 'salesrep_id',
  Territory_ID: 'territory_id',
  Sales_Team_ID: 'sales_team_id',
  Territory_Code: 'territory_code',
  Region_Code: 'region_code',
  Area_Code: 'area_code',
  Sales_Rep_Employee_ID: 'employee_id',
  Sales_Rep_First_Name: 'first_name',
  Sales_Rep_Last_Name: 'last_name',
  Sales_Rep_Title: 'title',
  Sales_Rep_User_ID: 'user_id',
  Sales_Rep_Email: 'email',
}

export const remapMssqlRecord = (record, mappings: {[id: string]: string}) => {
  const result = {} as UploadRecord;
  _.forEach(mappings, (v,k) => result[v] = record[k]);
  return result;
};
