import axios from "axios";
import {httpRoot} from "../httpConfig";
import {
  AuditNoteRecord,
  AuditStatusType, UpdateAuditMatch,
  getDataFields,
  NullableString,
} from '@trac/datatypes';

const auditApi = axios.create({
  baseURL: `${httpRoot}/`,
})

export type PostAuditData = (AuditNoteRecord[] | UpdateAuditMatch)
export const getAuditLocations = async ({
                                          status = null as AuditStatusType,
                                          uuid = null,
                                          customerId = null
                                        }) => {
  // console.log(`uuid '${uuid}' customer '${customerId}'`)
  let uri = 'audit/locations?withName=true';
  if (uuid) {
    uri += `&${getDataFields.uuid}=${uuid}`;
  }
  if (customerId) {
    uri += `&${getDataFields.customerId}=${customerId}`
  }
  if (status) {
    uri += `&${getDataFields.auditStatus}=${status}`
  }
  const axiosResponse = await auditApi.get(uri)
  return axiosResponse.data;
}

export const getAudit = async (uuid = null as NullableString) => {
  let uri = 'audit';
  if (uuid) {
    uri += `?${getDataFields.uuid}=${uuid}`;
  }
  const axiosResponse = await auditApi.get(uri)
  return axiosResponse.data;
}
export const getAuditedAccounts = async (uuid) => {
  const uri = 'audit/accounts/';
  const axiosResponse = await auditApi.post(uri, {uuid})
  return axiosResponse.data;
}

export const getOpenAudits = async () => {
  const uri = 'audit/open/';
  const axiosResponse = await auditApi.get(uri)
  ///console.log("line no 52-----"+axiosResponse.data);
  return axiosResponse.data;
}

export const removeAudit = async (uuid) => {
  let uri = 'audit';
  if (uuid) {
    uri += `?${getDataFields.uuid}=${uuid}`;
  } else {
    throw new Error('Need a uuid to remove an audit');
  }
  return auditApi.delete(uri)
    .then(result => {
      // console.log('delete audit result', result)
      return result;
    })
}

export const postAuditNotes = async (notes: AuditNoteRecord[]) => {
  const uri = 'audit/notes';
  await auditApi.post(uri, notes);
}

export const postBatchPriceUpdate = async (batch: UpdateAuditMatch) => {
  const uri = 'audit/items';
  await auditApi.post(uri, batch)
}
export const postAuditUpdate = async (uuid: NullableString, status: AuditStatusType) => {
  const uri = 'audit';
  console.log(`posting change ${status} for ${uuid}`);
  if(uuid === null) {
    console.error('postAuditUpdate called without uuid');
    return;
  }
  await auditApi.post(uri, {uuid, status})
}

