import {SignatureFields} from "./SearchSignature";
import {SalesRolesType} from "./SalesJumpRecord";

const dump = obj => JSON.stringify(obj, null, 2);

export const salesRepTableColumns = [
  {
    header: 'First Name',
    accessor: 'first_name',
  },
  {
    header: 'Last Name',
    accessor: 'last_name',
  },
  {
    header: 'Title',
    accessor: 'title',
  },
  {
    header: 'Territory Code',
    accessor: 'territory_code',
  },
  {
    header: 'Region Code',
    accessor: 'region_code',
  },
  {
    header: 'Area Code',
    accessor: 'area_code',
  },
  {
    header: 'Employee ID',
    accessor: 'employee_id',
  },
  {
    header: 'Sales Rep ID',
    accessor: 'salesrep_id',
  },
  {
    header: 'Territory ID',
    accessor: 'territory_id',
  },
  {
    header: 'Sales Team ID',
    accessor: 'sales_team_id',
  },
  {
    header: 'User ID',
    accessor: 'user_id',
  },
  {
    header: 'Email',
    accessor: 'email',
  },

];
export interface SalesRepSignature {
  salesrep_id: string;
  territory_id: string;
  sales_team_id: string;
  territory_code: string;
  region_code: string;
  area_code: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  title: string;
  role?: SalesRolesType;
  user_id: string;
  email: string;
}

export const initialSalesRepSignature = {
  salesrep_id: null,
  territory_id: null,
  sales_team_id: null,
  territory_code: null,
  region_code: null,
  area_code: null,
  employee_id: null,
  first_name: null,
  last_name: null,
  title: null,
  user_id: null,
  email: null,
}

export interface SalesRepRecord {
  uuid: string;
  salesrep_id: string;
  territory_id: string;
  sales_team_id: string;
  territory_code: string;
  region_code: string;
  area_code: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  title: string;
  role?: SalesRolesType;
  user_id?: string;
  email?: string;
}

export const initialSalesRepRecord = {
  salesrep_id: null,
  territory_id: null,
  sales_team_id: null,
  territory_code: null,
  region_code: null,
  area_code: null,
  employee_id: null,
  first_name: null,
  last_name: null,
  title: null,
  user_id: null,
  email: null,
}

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
export const salesRepsTextSearchFields: SignatureFields = {
  searchFields: [
    'salesrep_id',
  'territory_id',
  'sales_team_id',
  'territory_code',
  'region_code',
  'area_code',
  'employee_id',
  'first_name',
  'last_name',
  'title',
  'user_id',
  'email',
  ],
  type: 'salesreps',
  idFieldFn: () => "user_id"
};
export const matchSalesRepFields = (a,b) => {
  if(a.user_id === null || b.user_id === null) {
    return a.territory_id === b.territory_id;
  }
  return a.user_id === b.user_id;
}
export const transformSalesRepsRecord = t => {
  const result = [...t];
  // The indexes here are from the extracted array which has already skipped the columns defined in the data mappings
  result[1] = nullDetector(result[1], 'zero');
  result[3] = nullDetector(result[3], 'zerostring');
  result[4] = nullDetector(result[4], 'zerostring');
  result[5] = nullDetector(result[5], 'zerostring');
  result[6] = nullDetector(result[6], 'zero');
  result[7] = nullDetector(result[7], 'vacant');
  result[8] = nullDetector(result[8], 'vacant');
  result[10] = nullDetector(result[10], 'vacant');
  result[11] = nullDetector(result[11], 'vacant');
  return result;
}


