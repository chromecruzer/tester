import {SignatureFields} from "./SearchSignature";

export const customerContactTableColumns = [
  {
    header: 'Full Name',
    accessor: 'full_name',
  },
  {
    header: 'Account Name',
    accessor: 'account_name',
  },
  {
    header: 'Ship To ID',
    accessor: 'ship_to_id',
  },
  {
    header: 'Email',
    accessor: 'email',
  },
  {
    header: 'Email2',
    accessor: 'email2',
  },
  {
    header: 'Salutation',
    accessor: 'salutation',
  },
  {
    header: 'Contact Title',
    accessor: 'contact_title',
  },
  {
    header: 'Phone',
    accessor: 'phone',
  },
  {
    header: 'Mobile',
    accessor: 'mobile',
  },
];

export interface CustomerContactSignature {
  full_name: string;
  account_name: string;
  ship_to_id: string;
  email: string;
  email2: string;
  salutation: string;
  contact_title: string;
  phone: string;
}

export const initialCustomerContactSignature = {
  uuid: null,
  full_name: null,
  account_name: null,
  ship_to_id: null,
  email: null,
}

export interface CustomerContactRecord {
  uuid: string;
  full_name: string;
  account_name: string;
  ship_to_id: string;
  email: string;
  email2?: string;
  salutation?: string;
  contact_title?: string;
  phone?: string;
  mobile?: string;
}

export const initialCustomerContactRecord = {
  uuid: null,
  full_name: null,
  account_name: null,
  ship_to_id: null,
  email: null,
}
export const customerContactTextSearchFields: SignatureFields = {
  searchFields: [
    'full_name',
    'account_name',
    'ship_to_id',
    'email',
  ],
  type: 'CustomerContacts',
  idFieldFn: () => "full_name"
};
export const matchCustomerContactFields = (a,b) => {
  return a.full_name === b.full_name;
}

