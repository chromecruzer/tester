import {InputDataTypeLabel, InputToSqlMapping} from "./datatypes";

export const productDataMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'product_id',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'description',
    sqlType: 'varchar(50)',
  },
  {
    dataType: 'number',
    sqlLabel: 'unit_price',
    sqlType: 'numeric(10, 3)',
    default: 1.0,
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'product_id_level5',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'description_level5',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'product_id_level4',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'description_level4',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'product_id_level3',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'description_level3',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'product_id_level2',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'J',
    dataType: 'string',
    sqlLabel: 'description_level2',
    sqlType: 'varchar(50)',
  },
  {
    dataType: 'boolean',
    sqlLabel: 'excluded',
    sqlType: 'boolean',
    default: false,
  },

]
