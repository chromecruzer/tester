import {InputToSqlMapping} from './datatypes';
import _ from "lodash";
export const iolDataMapping : InputToSqlMapping [] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'warehouse',
    sqlType: 'char(5)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'location_code',
    sqlType: 'varchar(8)',
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'name_code',
    sqlType: 'char(8)',
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'address_phone',
    sqlType: 'varchar(100)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'item',
    sqlType: 'varchar(20)',
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'description',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'lot',
    sqlType: 'varchar(20)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'number',
    sqlLabel: 'quantity',
    sqlType: 'integer',
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'purchase_order',
    sqlType: 'varchar(30)',
  },
  {
    xlsxAddress: 'J',
    dataType: 'date',
    sqlLabel: 'received_date',
    sqlType: 'date',
  },
  {
    xlsxAddress: 'K',
    dataType: 'date',
    sqlLabel: 'expire_date',
    sqlType: 'date',
  },
  {
    xlsxAddress: 'L',
    dataType: 'date',
    sqlLabel: 'shipped_date',
    sqlType: 'date',
    nullify: e => _.isDate(e) ? e : null,
  }
];
