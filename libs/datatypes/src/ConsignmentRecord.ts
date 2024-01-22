import _ from 'lodash';
import {SignatureFields} from "./SearchSignature";
import {iolTableColumns} from "./IolRecord";

const iolColumns = [
  'item',
  'description',
  'lot',
  'quantity',
  'expire_date',
  'name_code'
];
const productColumns = [
  'product_id_level3',
  'unit_price'
]
export const consignmentTableColumnsFunc = () => {
  const results = [
    {
      header: 'Product UUID',
      accessor: 'prod_uuid'
    },
    {
      header: 'Product ID',
      accessor: 'product_id'
    },
    {
      header: 'Family',
      accessor: 'description4'
    },
    {
      header: 'Sub Family',
      accessor: 'description5'
    }
  ];
  iolTableColumns.forEach(p => {
    switch (p.accessor) {
      case 'item':
      case 'description':
      case 'lot':
      case 'quantity':
      case 'expire_date':
        results.push(p);
        break;
      case 'name_code':
        results.push({
          ...p,
          accessor: 'customer_id',
          header: 'Customer ID'
        });
        break;
      case 'location_code':
        results.push({
          ...p,
          accessor: 'warehouse',
          header: 'Warehouse'
        });
        break;
      default:
    }
  });
  return results;
}

export interface ConsignmentSignature {
  item: string;
  customer_id: string,
  warehouse: string,
  description: string;
  description4: string;
  description5: string;
  product_id: string;
  lot: string;
}

export const consignmentSearchSignature: SignatureFields= {
  searchFields: [
    'lot',
    'customer_id',
    'warehouse',
    'item',
    'description',
    'description4',
    'description5',
    'product_id',
  ],
  type: 'consignments',
  idFieldFn: () => 'lot',
};

export interface ConsignmentRecord {
  uuid: string;
  customer_id: string;
  warehouse: string,
  item: string;
  description: string;
  description4: string;
  description5: string;
  lot: string;
  quantity: number;
  expire_date: Date;
  prod_uuid: string;
  product_id: string;
  expire_status?: string
  unit_price?: number;
}

