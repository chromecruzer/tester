import axios from "axios";
import {httpRoot} from "../httpConfig";
import {NullableString} from '@trac/datatypes';

const salesrepApi = axios.create({
  baseURL: `${httpRoot}`,
})

export const getSalesReps = async ({
                               uuid = null as NullableString,
                               customerId = null as NullableString,
                               salesRepId = null as NullableString})  => {
  // console.log(`uuid '${uuid}' customer '${customerId}'`)
  let uri = '/salesreps';
  if(uuid) {
    uri += `/uuid/${uuid}`;
  }
  if(customerId) {
    uri += `/customerId/${customerId}`
  }
  if(salesRepId) {
    uri += `/salesrepId/${salesRepId}`
  }
    const axiosResponse = await salesrepApi.get(uri)
  return axiosResponse.data;
}
export const getAccounts = async (uuid, date) => {
  const uri = 'salesreps/accounts/';
  console.log(`getting sales rep account with uuid = ${uuid} and expiration date = ${date}`)
  const axiosResponse = await salesrepApi.post(uri, {uuid, date})
  // console.log('getAccounts data', axiosResponse.data);
  return axiosResponse.data;
}

