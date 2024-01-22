import {InputToSqlMapping} from "./datatypes";
const nullDetector = (field, type) => {
  let result;
  switch(type) {
    case 'zero':
      result =  field === '0' ? null : field;
      return result === '0000000' ? null : result;
    default:
      return field === 'Vacant' || field === 'Open' ? null : field;
  }
}

export const salesRepDataMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'salesrep_id',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'territory_id',
    sqlType: 'varchar(15)',
    nullify: (f) => nullDetector(f, 'zero'),
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'sales_team_id',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'territory_code',
    sqlType: 'varchar(15)',
    nullify: (f) => nullDetector(f, 'zero'),
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'region_code',
    sqlType: 'varchar(15)',
    nullify: (f) => nullDetector(f, 'zero'),
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'area_code',
    sqlType: 'varchar(15)',
    nullify: (f) => nullDetector(f, 'zero'),
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'employee_id',
    sqlType: 'varchar(15)',
    nullify: (f) => nullDetector(f, 'zero'),
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'first_name',
    sqlType: 'varchar(25)',
    nullify: (f) => nullDetector(f, 'vacant'),
  },
  {
    xlsxAddress: 'J',
    dataType: 'string',
    sqlLabel: 'last_name',
    sqlType: 'varchar(25)',
    nullify: (f) => nullDetector(f, 'vacant'),
  },
  {
    xlsxAddress: 'K',
    dataType: 'string',
    sqlLabel: 'title',
    sqlType: 'varchar(7)',
  },
  {
    xlsxAddress: 'L',
    dataType: 'string',
    sqlLabel: 'user_id',
    sqlType: 'varchar(50)',
    nullify: (f) => nullDetector(f, 'vacant'),
  },
  {
    xlsxAddress: 'M',
    dataType: 'string',
    sqlLabel: 'email',
    sqlType: 'varchar(50)',
    nullify: (f) => nullDetector(f, 'vacant'),
  },
];
