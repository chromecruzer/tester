import {InputToSqlMapping} from "./datatypes";
import {SalesRepRecord} from "./SalesRepRecord";

export type SalesRoleDetails = {
  sqlTerritoryField: string;
  sqlNameField: string;
  role: string;
  abbreviation: string;
};
export const salesRolePriority = [
  'STM',
  'PDM',
  'KAE',
  'SDMC',
  'SDMR',
];
export type SalesRolesType = (
  'STM' |
  'KAE' |
  'SDMC' |
  'SDMR' |
  'PDM');
export const salesRoles: { [id: string]: SalesRoleDetails } = {
  STM: {
    sqlTerritoryField: 'primary_territory',
    sqlNameField: 'primary_name',
    role: 'Surgical Territory Manager',
    abbreviation: 'STM',
  },
  KAE: {
    sqlTerritoryField: 'kae_territory',
    sqlNameField: 'kae_name',
    role: 'Key Account Executive',
    abbreviation: 'KAE',
  },
  SDMC: {
    sqlTerritoryField: 'secondary_territory',
    sqlNameField: 'secondary_name',
    role: 'Surgical Device Manager',
    abbreviation: 'SDMC',
  },
  SDMR: {
    sqlTerritoryField: 'rtm_territory',
    sqlNameField: 'rtm_name',
    role: 'Retina Device Manager',
    abbreviation: 'SDMR',
  },
  PDM: {
    sqlTerritoryField: 'cos_territory',
    sqlNameField: 'cos_name',
    role: 'Practice Development Manager',
    abbreviation: 'PDM',
  },
};

export interface SalesJumpRecord {
  uuid: string;
  customer_id: string;
  salesrep_id?: string;
  salesrep_uuid?: string;
  territory: string;
  role: string;
}

export const salesJumpDataMapping: InputToSqlMapping[] = [
  {
    dataType: 'string',
    sqlLabel: 'customer_id',
    sqlType: 'varchar(15)',
  },
  {
    dataType: 'string',
    sqlLabel: 'salesrep_id',
    sqlType: 'varchar(15)',
  },
  {
    dataType: 'string',
    sqlLabel: 'salesrep_uuid',
    sqlType: 'UUID',
  },
  {
    dataType: 'string',
    sqlLabel: 'role',
    sqlType: 'varchar(6)',
  },
  {
    dataType: 'string',
    sqlLabel: 'territory',
    sqlType: 'varchar(20)',
  },
];
