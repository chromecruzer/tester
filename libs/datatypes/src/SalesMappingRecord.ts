export const salesMappingsTableColumns = [
  {
    header: 'Customer ID',
    accessor: 'customer_ship_to',
  },
  {
    header: 'Postal',
    accessor: 'postal',
  },
  {
    header: 'Zip Code',
    accessor: 'zipcode',
  },
  {
    header: 'Surgical Territory',
    accessor: 'primary_territory',
  },
  {
    header: 'Surgical Territory Manager Name',
    accessor: 'primary_name',
  },
  {
    header: 'Practice Development Territory',
    accessor: 'cos_territory',
  },
  {
    header: 'Practice Development Name',
    accessor: 'cos_name',
  },
  {
    header: 'Key Account Exec Territory',
    accessor: 'kae_territory',
  },
  {
    header: 'Key Account Exec Name',
    accessor: 'kae_name',
  },
];

export interface SalesMappingRecord {
  uuid: string;
  customer_ship_to: string;
  postal: string;
  zipcode: string;
  primary_territory: string;
  primary_name: string;
  kae_territory: string;
  kae_name: string;
  secondary_territory: string;
  secondary_name: string;
  vrs_territory: string;
  vrs_name: string;
  rtm_territory: string;
  rtm_name: string;
  cos_territory: string;
  cos_name: string;
  atm_territory: string;
  atm_name: string;
  ases_territory: string;
  ases_name: string;
  cust_adv_territory: string;
  cust_adv_name: string;
  eas_territory: string;
  eas_name: string;
  vs_territory: string;
  vs_name: string;
  pds_territory: string;
  pds_name: string;
  ent_territory: string;
  ent_name: string;
  iss_territory: string;
  iss_name: string;
  sir_territory: string;
  sir_name: string;
  clae_territory: string;
  clae_name: string;
  other_territory: string;
  other_name: string;
}

export const initialSalesMappingRecord = {
  customer_ship_to: null,
  postal: null,
  zipcode: null,
  primary_territory: null,
  primary_name: null,
  kae_territory: null,
  kae_name: null,
  cos_territory: null,
  cos_name: null,
  atm_territory: null,
  atm_name: null,
  ases_territory: null,
  ases_name: null,
  cust_adv_territory: null,
  cust_adv_name: null,
  eas_territory: null,
  eas_name: null,
  vs_territory: null,
  vs_name: null,
  pds_territory: null,
  pds_name: null,
  ent_territory: null,
  ent_name: null,
  iss_territory: null,
  iss_name: null,
  sir_territory: null,
  sir_name: null,
  clae_territory: null,
  clae_name: null,
  other_territory: null,
  other_name: null,
}

export const matchSalesMappingFields = (a, b) => {
  return a.customer_ship_to === b.customer_ship_to;
}


