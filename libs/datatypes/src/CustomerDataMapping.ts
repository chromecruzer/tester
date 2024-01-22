import {InputToSqlMapping, removeTrailingSpace, spaceNull} from "./datatypes";

export const customerDataMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'customer_code',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'name',
    sqlType: 'varchar(100)',
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'dea_number',
    sqlType: 'varchar(25)',
    nullify: spaceNull,
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'hin_number',
    sqlType: 'varchar(25)',
    nullify: spaceNull,
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'address',
    sqlType: 'varchar(100)',
    nullify: removeTrailingSpace,
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'city',
    sqlType: 'varchar(50)',
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'state',
    sqlType: 'varchar(20)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'postal',
    sqlType: 'varchar(12)',
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'phone',
    sqlType: 'varchar(20)',
    nullify: spaceNull,
  },
  {
    dataType: 'date',
    sqlLabel: 'last_expire_email',
    sqlType: 'date',
  },
  {
    dataType: 'date',
    sqlLabel: 'last_audit_email',
    sqlType: 'date',
  },
];
