import axios from "axios";
import {httpRoot} from "../httpConfig";
const consignmentApi = axios.create({
  baseURL: `${httpRoot}`,
})

export const getConsignments = async (customerId) => {
  const uri = customerId ? `consignments/${customerId}` : 'consignments';
  const axiosResponse = await consignmentApi.get(uri)
  return axiosResponse.data;
};
export const getIolDuplicates = async () => {
  const uri = 'iol/duplicates';
  const axiosResponse = await consignmentApi.get(uri)
  return axiosResponse.data;
};

