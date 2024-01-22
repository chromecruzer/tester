// Customer_ID	Customer_Name	DEA_Number	HIN_Number	Address	City	State	Postal	Phone

import {InputToSqlMapping} from "@trac/datatypes";
export const customerMssqlMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'Customer_ID',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'Customer_Name',
    sqlType: 'varchar(100)',
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'DEA_Number',
    sqlType: 'varchar(25)',
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'HIN_Number',
    sqlType: 'varchar(25)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'Address',
    sqlType: 'varchar(100)',
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'City',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'State',
    sqlType: 'varchar(20)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'Postal',
    sqlType: 'varchar(12)',
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'Phone',
    sqlType: 'varchar(20)',
  },
];

// Product_ID	Product_Name	Product_Level5_ID	Product_Level5_Desc	Product_Level4_ID	Product_Level4_Desc
// Product_Level3_ID	Product_Level3_Desc	Product_Level2_ID	Product_Level2_Desc
export const productMssqlMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'Product_ID',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'Product_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'Product_Level5_ID',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'Product_Level5_Desc',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'Product_Level4_ID',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'Product_Level4_Desc',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'Product_Level3_ID',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'Product_Level3_Desc',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'Product_Level2_ID',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'J',
    dataType: 'string',
    sqlLabel: 'Product_Level2_Desc',
    sqlType: 'varchar(50)',
  },
];

// Customer_Ship_To	Postal	Zip_code	Primary_Terr	Primary_Name	KAE_Terr	KAE_Name	Secondary_Terr	Secondary_Name
// VRS_Terr	VRS_Rep	RTM_Terr	RTM_Rep	COS_Terr	COS_Name	ATM_Terr	ATM_Name	ASES_Terr	ASES_Name	Cust_Adv_Terr
// Cust_Adv Name	EAS_Terr	EAS_Name	VS_Terr	VS_Name	PDS_Terr	PDS_Name	ENT_Terr	ENT_Rep	ISS_Terr	ISS_Rep	SIR_Terr
// SIR_Name	CLAE_Terr	CLAE_Name	Other_Terr	Other_Desc
export const salesMappingMssqlMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'Customer_Ship_To',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'Postal',
    sqlType: 'varchar(12)',
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'Zip_code',
    sqlType: 'varchar(8)',
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'Primary_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'Primary_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'KAE_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'KAE_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'Secondary_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'Secondary_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'J',
    dataType: 'string',
    sqlLabel: 'VRS_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'K',
    dataType: 'string',
    sqlLabel: 'VRS_Rep',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'L',
    dataType: 'string',
    sqlLabel: 'RTM_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'M',
    dataType: 'string',
    sqlLabel: 'RTM_Rep',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'N',
    dataType: 'string',
    sqlLabel: 'COS_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'O',
    dataType: 'string',
    sqlLabel: 'COS_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'P',
    dataType: 'string',
    sqlLabel: 'ATM_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'Q',
    dataType: 'string',
    sqlLabel: 'ATM_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'R',
    dataType: 'string',
    sqlLabel: 'ASES_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'S',
    dataType: 'string',
    sqlLabel: 'ASES_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'T',
    dataType: 'string',
    sqlLabel: 'Cust_Adv_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'U',
    dataType: 'string',
    sqlLabel: 'Cust_Adv Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'V',
    dataType: 'string',
    sqlLabel: 'EAS_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'W',
    dataType: 'string',
    sqlLabel: 'EAS_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'X',
    dataType: 'string',
    sqlLabel: 'VS_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'Y',
    dataType: 'string',
    sqlLabel: 'VS_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'Z',
    dataType: 'string',
    sqlLabel: 'PDS_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'AA',
    dataType: 'string',
    sqlLabel: 'PDS_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'AB',
    dataType: 'string',
    sqlLabel: 'ENT_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'AC',
    dataType: 'string',
    sqlLabel: 'ENT_Rep',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'AD',
    dataType: 'string',
    sqlLabel: 'ISS_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'AE',
    dataType: 'string',
    sqlLabel: 'ISS_Rep',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'AF',
    dataType: 'string',
    sqlLabel: 'SIR_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'AG',
    dataType: 'string',
    sqlLabel: 'SIR_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'AH',
    dataType: 'string',
    sqlLabel: 'CLAE_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'AI',
    dataType: 'string',
    sqlLabel: 'CLAE_Name',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'AJ',
    dataType: 'string',
    sqlLabel: 'Other_Terr',
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'AK',
    dataType: 'string',
    sqlLabel: 'Other_Desc',
    sqlType: 'varchar(50)',
  },
];
// Sales_Rep_ID	Business_Unit_ID	Territory_ID	Sales_Team_ID	Territory_Code	Region_Code	Area_Code
// Sales_Rep_Employee_ID	Sales_Rep_First_Name	Sales_Rep_Last_Name	Sales_Rep_Title	Sales_Rep_User_ID	Sales_Rep_Email
// Active_Ind	Effective_Date	Expiration_Date	Insert_Date	Update_Date
export const salesRepMssqlMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'Sales_Rep_ID',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'Business_Unit_ID',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'Territory_ID',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'Sales_Team_ID',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'Territory_Code',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'Region_Code',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'Area_Code',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'Sales_Rep_Employee_ID',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'Sales_Rep_First_Name',
    sqlType: 'varchar(25)',
  },
  {
    xlsxAddress: 'J',
    dataType: 'string',
    sqlLabel: 'Sales_Rep_Last_Name',
    sqlType: 'varchar(25)',
  },
  {
    xlsxAddress: 'K',
    dataType: 'string',
    sqlLabel: 'Sales_Rep_Title',
    sqlType: 'varchar(7)',
  },
  {
    xlsxAddress: 'L',
    dataType: 'string',
    sqlLabel: 'Sales_Rep_User_ID',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'M',
    dataType: 'string',
    sqlLabel: 'Sales_Rep_Email',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'N',
    dataType: 'string',
    sqlLabel: 'Active_Ind',
    sqlType: 'varchar(5)',
  },
];
export const mssqlMappings = {
  customers: customerMssqlMapping,
  products: productMssqlMapping,
  mappings: salesMappingMssqlMapping,
  salesReps: salesRepMssqlMapping
}
