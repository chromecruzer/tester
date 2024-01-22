import {SignatureFields} from "./SearchSignature";
import _ from "lodash";
export const condensedProductTableColumns = [
  {
    header: 'Product ID',
    accessor: 'product_id',
  },
  {
    header: 'Description',
    accessor: 'description',
  },
  {
    header: 'Unit Price',
    accessor: 'unit_price',
  },
  {
    header: 'Family',
    accessor: 'description4'
  },
  {
    header: 'Sub Family',
    accessor: 'description5'
  },
  {
    header: 'Details',
    accessor: 'details'
  },
  {
    header: 'Flag',
    accessor: 'excluded',
  },
];
export const productTableColumns = [
  {
    header: 'Product ID',
    accessor: 'product_id',
  },
  {
    header: 'Description',
    accessor: 'description',
  },
  {
    header: 'Unit Price',
    accessor: 'unit_price',
  },
  {
    header: 'Level 5 ID',
    accessor: 'product_id_level5',
  },
  {
    header: 'Level 5 Description',
    accessor: 'description_level5',
  },
  {
    header: 'Level 4 ID',
    accessor: 'product_id_level4',
  },
  {
    header: 'Level 4 Description',
    accessor: 'description_level4',
  },
  {
    header: 'Level 3 ID',
    accessor: 'product_id_level3',
  },
  {
    header: 'Level 3 Description',
    accessor: 'description_level3',
  },
  {
    header: 'Level 2 ID',
    accessor: 'product_id_level2',
  },
  {
    header: 'Level 2 Description',
    accessor: 'description_level2',
  },
  {
    header: 'Flag',
    accessor: 'excluded',
  },
];

export interface ProductSignature {
  product_id: string;
  description: string;
}

export interface ProductRecord {
  uuid: string;
  product_id: string;
  description: string;
  unit_price: number;
  product_id_level5: string;
  description_level5: string;
  product_id_level4: string;
  description_level4: string;
  product_id_level3: string;
  description_level3: string;
  product_id_level2: string;
  description_level2: string;
  excluded: boolean;
}

export const productTextSearchFields: SignatureFields = {
  searchFields: [
    'product_id',
    'description',
    'product_id_level5',
    'description_level5',
    'product_id_level4',
    'description_level4',
    'product_id_level3',
    'description_level3',
    'product_id_level2',
    'description_level2',
  ],
  type: 'products',
  idFieldFn: () => 'product_id'
};
export const matchProductFields = (a,b) => {
  return a.product_id_level5 === b.product_id_level5 &&
    a.product_id_level4 === b.product_id_level4 &&
    a.product_id_level3 === b.product_id_level3 &&
    a.product_id_level2 === b.product_id_level2;
}


