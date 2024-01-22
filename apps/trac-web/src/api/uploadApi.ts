import axios from "axios";
import {httpRoot} from "../httpConfig";
import {
  Comparisons,
  NullableString,
  UploadAuditDetails,
  uploadHeaders,
  UploadSupportedFileTypes
} from '@trac/datatypes';
export interface UploadFormData {
  file: (File | null);
  user: string;
  type: UploadSupportedFileTypes;
  scanner?: string;
  location_code?: string;
  scan_date?: string;
  is_audit?: boolean,
}

export interface UploadResponsePayload {
  comparisons: (UploadAuditDetails | Comparisons | null);
  session: (string | null),
  upload_filetype: (string | null),
}

const uploadApi = axios.create({
  baseURL: `${httpRoot}/upload`,
})
export const getUploadHistory = async () => {
  const response = await uploadApi.get(`history`)
  return response.data;
}

export const postSubmit = async (formData: UploadFormData) => {
  const form = new FormData();
  if(formData.file) {
    form.append(uploadHeaders.fileField, formData.file);
  }
  form.append(uploadHeaders.userField, formData.user || 'unknown');
  const type = formData.type;
  console.log(`form field ${uploadHeaders.isSetField}`, uploadHeaders);
  if (type === 'audit_scans') {
    form.append(uploadHeaders.scannerField, formData[uploadHeaders.scannerField]);
    form.append(uploadHeaders.scanDateField, formData[uploadHeaders.scanDateField]);
    form.append(uploadHeaders.locationField, formData[uploadHeaders.locationField]);
    form.append(uploadHeaders.isSetField, formData.is_audit ? 'AUDIT' : 'CHECKIN');
  }
  const config = {
    headers: {
      'content-type': 'multipart/form-data'
    }
  }
  const response = await uploadApi.post(`/${type}/submit`, form, config)
  // console.log('received upload analytics response headers', response.headers);
  // console.log('received upload analytics response data', response.data);
  const analytics = response.data;
  console.log('analytics response data', analytics);
  // console.log('analytics response', response);
  return {
    details: null,
    analytics,
    session: response.headers[uploadHeaders.tokenHeader],
    upload_filetype: type
  };
}
export const getComparisons = async (session: NullableString, type: (UploadSupportedFileTypes | null)) => {
  if(session === null || type === null) {
    console.error(`null session ${session} or type ${type}`);
    return Promise.resolve(null);
  }
  const config = {
    headers: {}
  }
  config.headers[uploadHeaders.tokenHeader] = session;
  const response = await uploadApi.get(`/${type}/comparisons`, config)
  // console.log('received upload analytics response headers', response.headers);
  // console.log('received upload analytics response data', response.data);
  const comparisons = response.data;
  // console.log('analytics response data', comparisons);
  // console.log('analytics response', response);
  return {
    comparisons,
    session: response.headers[uploadHeaders.tokenHeader],
    upload_filetype: type
  } as UploadResponsePayload
}

export const postCommit = async (session: NullableString, type: (UploadSupportedFileTypes | null)) => {
  if(session === null || type === null) {
    console.error(`null session ${session} or type ${type}`);
    return Promise.resolve(null);
  }
  const config = {
    headers: {}
  }
  config.headers[uploadHeaders.tokenHeader] = session;
  const response = await uploadApi.post(`/${type}/commit`, {}, config)
  // console.log('received upload commit response headers', response.headers);
  // console.log('received upload commit response', response.data);
  return response.data;
}

export const postCancel = async (session: NullableString, type: (UploadSupportedFileTypes | null)) => {
  if(session === null || type === null) {
    console.error(`null session ${session} or type ${type}`);
    return Promise.resolve(null);
  }
  const config = {
    headers: {}
  }
  config.headers[uploadHeaders.tokenHeader] = session;
  const response = await uploadApi.post(`/${type}/cancel`, {}, config)
  // console.log('received upload commit response headers', response.headers);
  // console.log('received upload cancel response', response.data);
  return response.data
}
export const postUploadRefresh = async user => {
    return uploadApi.post(`/refresh`, {user})
}
