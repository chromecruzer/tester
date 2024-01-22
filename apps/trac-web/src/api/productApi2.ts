import axios from "axios";
import {httpRoot} from "../httpConfig";
import {NullableString} from '@trac/datatypes';

export interface ProductBatch {
  items: string[];
  price?: number;
  flag?: boolean;
}
const productApi = axios.create({
  baseURL: `${httpRoot}`,
})


export const getProducts = async (uuid = null as NullableString) => {
  let uri = '/products2';
  if (uuid) {
    uri += `/uuid/${uuid}`; 
  }
  console.log(`getting ${uuid ? `products from uuid ${uuid}` : 'all products2 for testing purpose'}`)
  const axiosResponse = await productApi.get(uri)
  return axiosResponse.data;
}
export const postBatchPriceUpdate = async (batch: ProductBatch) => {
  const uri = 'products2';
  return productApi.post(uri, batch);
}
export const postBatchExcludeUpdate = async (batch: ProductBatch) => {
  const uri = 'products2';
  return productApi.post(uri, batch);
}

