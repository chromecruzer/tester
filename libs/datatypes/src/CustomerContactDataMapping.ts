import {InputToSqlMapping, removeTrailingSpace, spaceNull} from "./datatypes";
const nullDetector = (field) => {
  return field === 'Other' ? null : field;
}
export const customerContactDataMapping: InputToSqlMapping[] = [
  {
    xlsxAddress: 'A',
    dataType: 'string',
    sqlLabel: 'full_name',
    sqlType: 'varchar(100)',
  },
  {
    xlsxAddress: 'B',
    dataType: 'string',
    sqlLabel: 'account_name',
    sqlType: 'varchar(100)',
    nullify: removeTrailingSpace,
  },
  {
    xlsxAddress: 'C',
    dataType: 'string',
    sqlLabel: 'ship_to_id',
    sqlType: 'varchar(15)',
  },
  {
    xlsxAddress: 'D',
    dataType: 'string',
    sqlLabel: 'email',
    sqlType: 'varchar(55)',
  },
  {
    xlsxAddress: 'E',
    dataType: 'string',
    sqlLabel: 'email2',
    sqlType: 'varchar(55)',
    nullify: spaceNull,
  },
  {
    xlsxAddress: 'F',
    dataType: 'string',
    sqlLabel: 'salutation',
    sqlType: 'varchar(5)',
    nullify: spaceNull,
  },
  {
    xlsxAddress: 'G',
    dataType: 'string',
    sqlLabel: 'contact_title',
    nullify: nullDetector,
    sqlType: 'varchar(40)',
  },
  {
    xlsxAddress: 'H',
    dataType: 'string',
    sqlLabel: 'phone',
    sqlType: 'varchar(40)',
    nullify: spaceNull,
  },
  {
    xlsxAddress: 'I',
    dataType: 'string',
    sqlLabel: 'mobile',
    sqlType: 'varchar(40)',
    nullify: spaceNull,
  },
];
