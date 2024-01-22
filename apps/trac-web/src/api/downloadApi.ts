import axios, {AxiosResponse} from "axios";
import {httpRoot} from "../httpConfig";
import {getDataFields, NullableString} from "@trac/datatypes";

const downloadApi = axios.create({
  baseURL: `${httpRoot}/download`,
})

export type DownloadType = ('spreadsheet' | 'auditPdf' | 'consignmentPdf');
const downloadUri = {
  spreadsheet: 'spreadsheet',
  auditPdf: 'pdf/audit',
  consignmentPdf: 'pdf/consignment',
}


export interface DownloadState {
  loading: boolean,
  data: { blob: (Blob | null), filename: NullableString },
  error: string,
}
export const postDownloadSpreadsheet = async (headers, data) => {
  const filenameRegex = /filename="([^"]+)"/;
  const body = {};
  body[getDataFields.headers] = headers;
  body[getDataFields.spreadsheet] = data;
  const response = await downloadApi.post(`spreadsheet`, body, {responseType: 'blob'})
  const blob = new Blob([(response as AxiosResponse).data]);
  // console.log('response', response);
  const tokens = filenameRegex.exec((response as AxiosResponse).headers['content-disposition']) || [];
  console.log('response header', (response as AxiosResponse).headers['content-disposition'], tokens);
  return {blob, filename: tokens[1]};
}
export const postDownloadAuditSpreadsheet = async (headers, notesMappings) => {
  const filenameRegex = /filename="([^"]+)"/;
  const body = {};
  const auditHeader = 'Audit Notes';
  body[getDataFields.headers] = [...headers, {header:auditHeader, accessor:'notes'}];
  body[getDataFields.spreadsheet] = notesMappings.extractItemsWithNotes();
  body[getDataFields.spreadsheet0] = notesMappings.getFlattenedAuditNotes(auditHeader);
  console.log('audit spreadsheet content', body);
  const response = await downloadApi.post(`spreadsheet`, body, {responseType: 'blob'})
  const blob = new Blob([(response as AxiosResponse).data]);
  // console.log('response', response);
  const tokens = filenameRegex.exec((response as AxiosResponse).headers['content-disposition']) || [];
  console.log('response header', (response as AxiosResponse).headers['content-disposition'], tokens);
  return {blob, filename: tokens[1]};
}
export const postDownloadPdf = async (customerId, auditUuid, date, data, type: DownloadType) => {
  const filenameRegex = /filename="([^"]+)"/;
  const body = {};
  body[getDataFields.customerId] = customerId;
  body[getDataFields.uuid] = auditUuid;
  body[getDataFields.date] = date;
  body[getDataFields.spreadsheet] = data;
  console.log('download pdf body', body);
  const response = await downloadApi.post(downloadUri[type], body,
    {responseType: 'blob'})
  const blob = new Blob([(response as AxiosResponse).data]);
  // console.log('response', response);
  const tokens = filenameRegex.exec((response as AxiosResponse).headers['content-disposition']) || [];
  console.log('response header', (response as AxiosResponse).headers['content-disposition'], tokens);
  return {blob, filename: tokens[1]}
}

