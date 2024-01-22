import {SignatureFields} from "./SearchSignature";

const dump = obj => JSON.stringify(obj, null, 2);

export const iolTableColumns = [
  {
    header: 'Warehouse',
    accessor: 'warehouse',
    width: 20
  },
  {
    header: 'Location Code',
    accessor: 'location_code',
    width: 20

  },
  {
    header: 'Name Code',
    accessor: 'name_code',
    width: 20

  },
  {
    header: 'Address & Phone',
    accessor: 'address_phone',
    width: 70

  },
  {
    header: 'Item',
    accessor: 'item',
    width: 20

  },
  {
    header: 'Description',
    accessor: 'description',
    width: 20

  },
  {
    header: 'Lot Number',
    accessor: 'lot',
    width: 20
  },
  {
    header: 'Quantity',
    accessor: 'quantity',
    width: 20
  },
  {
    header: 'Purchase Order',
    accessor: 'purchase_order',
    width: 20
  },
  {
    header: 'Received Date',
    accessor: 'received_date',
    width: 20
  },
  {
    header: 'Expiry Date',
    accessor: 'expire_date',
    width: 20
  },
  {
    header: 'Shipped Date',
    accessor: 'shipped_date',
    width: 20
  },
]

export interface IolSignature {
  item: string;
  description: string;
  lot: string;
}

export interface IolRecord {
  uuid: string;
  warehouse: string;
  location_code: string;
  name_code: string;
  address_phone: string;
  item: string;
  description: string;
  lot: string;
  quantity: number;
  purchase_order: string;
  received_date: Date;
  expire_date: Date;
  shipped_date: Date;
}

export const iolTextSearchFields: SignatureFields = {
  searchFields: [
    'warehouse',
    'location_code',
    'name_code',
    'address_phone',
    'item',
    'description',
    'lot',
    'purchase_order',
  ],
  type: 'iol_report',
  idFieldFn: () => 'lot',
};

export const matchIolFields = (a,b) => {
  return a.name_code === b.name_code &&
    a.item === b.item;
}
export const transformIolRecord = t => {
  const result = [...t];
  if(result[2].length < 8) { //customer code needs to be prepended with zero
    result[2] = `0${result[2]}`;
  }
  return result;
}

