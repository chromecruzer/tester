import axios from "axios";
import {httpRoot} from "../httpConfig";
import {NullableString} from '@trac/datatypes';


const customerApi = axios.create({
  baseURL: `${httpRoot}`,
})


export const getCustomers = async ({
                                     uuid = null as NullableString,
                                     customerId = null as NullableString,
                                     salesRepId = null as NullableString
                                   }) => {
  // console.log(`uuid '${uuid}' customer '${customerId}' sales rep id ${salesRepId}`)
  let uri = '/customers';
  if (uuid) {
    uri += `/uuid/${uuid}`;
  }
  if (customerId) {
    uri += `/customerId/${customerId}`
  }
  if (salesRepId) {
    uri += `/salesrepId/${salesRepId}`
  }
  // console.log(`getting customers from uuid ${uuid}, customerId ${customerId} or salesRepId ${salesRepId} creates ${uri}`)
  const axiosResponse = await customerApi.get(uri)
  return axiosResponse.data;
}
export const getCustomerContacts = async ({
                                            uuid = null as NullableString,
                                            customerId = null as NullableString,
                                          }) => {
  // console.log(`uuid '${uuid}' customer '${customerId}' sales rep id ${salesRepId}`)
  let uri = '/customerContacts';
  if (uuid) {
    uri += `/uuid/${uuid}`;
  }
  if (customerId) {
    uri += `/customerId/${customerId}`
  }
  // console.log(`getting customers from uuid ${uuid}, customerId ${customerId} or salesRepId ${salesRepId} creates ${uri}`)
  const axiosResponse = await customerApi.get(uri)
  return axiosResponse.data;
}

export const getSalesMappings = async ({
                                            uuid = null as NullableString,
                                            customerId = null as NullableString,
                                          }) => {
  // console.log(`uuid '${uuid}' customer '${customerId}' sales rep id ${salesRepId}`)
  let uri = '/salesMappings';
  if (uuid) {
    uri += `/uuid/${uuid}`;
  }
  if (customerId) {
    uri += `/customerId/${customerId}`
  }
  // console.log(`getting customers from uuid ${uuid}, customerId ${customerId} or salesRepId ${salesRepId} creates ${uri}`)
  const axiosResponse = await customerApi.get(uri)
  return axiosResponse.data;
}

