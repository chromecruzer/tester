import {SignatureFields} from "./SearchSignature";
import {
  dateCompare,
  dateToTimestamp,
  NullableString,
} from "./datatypes";
import {AuditStatusType} from "./AuditRecord";
import {EmailStatusType} from "./EmailSettings";

const dump = obj => JSON.stringify(obj, null, 2);

export const customerTableColumns = [
  {
    header: 'Customer Code',
    accessor: 'customer_code',
  },
  {
    header: 'Name',
    accessor: 'name',
  },
  {
    header: 'DEA Number',
    accessor: 'dea_number',
  },
  {
    header: 'HIN Number',
    accessor: 'hin_number',
  },
  {
    header: 'Address',
    accessor: 'address',
  },
  {
    header: 'City',
    accessor: 'city',
  },
  {
    header: 'State',
    accessor: 'state',
  },
  {
    header: 'Postal Code',
    accessor: 'postal',
  },
  {
    header: 'Phone',
    accessor: 'phone',
  },
  {
    header: 'Last Expire Email',
    accessor: 'last_expire_email',
  },
  {
    header: 'Last Audit Email',
    accessor: 'last_audit_email',
  },
];

export const accountTotalsColumns = [
  {
    header: 'Customer Code',
    accessor: 'customer_code',
    alignment: 'center',
  },
  {
    header: 'Name',
    accessor: 'name',
    alignment: 'left',
  },
  {
    header: 'Total Value',
    accessor: 'totalValue',
    alignment: 'right',
  },
  {
    header: 'Number of Expired',
    accessor: 'totalExpired',
    alignment: 'right',
  },
  {
    header: 'Last Expire Email',
    accessor: 'last_expire_email',
  },
  {
    header: 'Account Email Status',
    accessor: 'missingEmails',
  },
];
export const accountAuditTotalsColumns = [
  {
    header: 'Customer Code',
    accessor: 'customer_code',
    alignment: 'center',
  },
  {
    header: 'Name',
    accessor: 'name',
    alignment: 'left',
  },
  {
    header: 'Last Audited',
    accessor: 'latestAuditDate',
    sortingFn: dateCompare,
    sortConvertFn: dateToTimestamp,
    alignment: 'right',
  },
  {
    header: 'Latest Audit Status',
    accessor: 'latestAuditStatus',
    alignment: 'right',
  },
  {
    header: 'Total Value',
    accessor: 'totalValue',
    alignment: 'right',
  },
  {
    header: 'Number of Expired',
    accessor: 'totalExpired',
    alignment: 'right',
  },
  {
    header: 'Last Audit Email',
    accessor: 'last_audit_email',
  },
  {
    header: 'Account Email Status',
    accessor: 'missingEmails',
  },
];
export interface CustomerSignature {
  customer_code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal: string;
}

export const initialCustomerSignature = {
  uuid: null,
  customer_code: null,
  name: null,
  address: null,
  city: null,
  state: null,
  postal: null,
}

export interface CustomerRecord {
  uuid: string;
  customer_code: string;
  name: string;
  dea_number?: string;
  hin_number?: string;
  address: string;
  city: string;
  state: string;
  postal: string;
  phone: string;
  last_expire_email?: Date;
  last_audit_email?: Date;
}
export interface AccountSummaryRecord extends CustomerRecord {
  totalValue?: number;
  totalExpired?: number;
  latestAuditStatus:AuditStatusType;
  latestAuditDate: NullableString;
  latestAuditUnresolved?: number;
  latestAuditUuid: string;
  missingEmails: EmailStatusType;
}
export const addAuditToCustomer = (customer, latestAudit): AccountSummaryRecord => {
  const result = {...customer};
  result.latestAuditStatus = latestAudit.status;
  result.latestAuditDate = latestAudit.date;
  result.latestAuditUnresolved = latestAudit.unresolved;
  result.latestAuditUuid = latestAudit.uuid;
  // console.log(`customer with audit ${dump(result)}`)
  return result;
}
export const initialCustomerRecord = {
  uuid: null,
  customer_code: null,
  name: null,
  address: null,
  city: null,
  state: null,
  postal: null,
  phone: null,
}

export const customerTextSearchFields: SignatureFields = {
  searchFields: [
    'customer_code',
    'name',
    'dea_number',
    'hin_number',
    'address',
    'city',
    'state',
    'postal',
    'phone',
  ],
  type: 'customers',
  idFieldFn: () => "customer_code"
};
export const matchCustomerFields = (a,b) => {
  return a.name === b.name &&
    a.address === b.address;
}

