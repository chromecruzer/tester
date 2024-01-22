import axios from "axios";
import {httpRoot} from "../httpConfig";
import {getDataFields, uploadHeaders} from "@trac/datatypes";

const emailApi = axios.create({
  baseURL: `${httpRoot}/`,
})

export interface UploadTemplateType {
  file: (File | null);
  emailTemplateType: string;
}


export const postTestEmails = async (testEmails, accountIdsOrAuditUuids, emailTemplateType) => {
  const uri = '/email/test';
  await emailApi.post(uri, {testEmails, items: accountIdsOrAuditUuids, emailTemplateType})
}
export const postSendEmails = async (batchOrder) => {
  const uri = '/email/send';
  await emailApi.post(uri, {order: batchOrder})
}
export const postGetDraft = async (order) => {
  const uri = '/email/draft';
  return emailApi.post(uri, {order})
    .then(response => {
      console.log('draft returned', response)
      return response.data;
    });
}
export const getMissingEmails = async () => {
  const uri = '/email/missing';
  const axiosResponse = await emailApi.get(uri)
  return axiosResponse.data;
}
export const getEmailSettings= async () => {
  const uri = '/settings/email';
  const axiosResponse = await emailApi.get(uri)
  return axiosResponse.data;
}
export const postEmailSettings = async (settings) => {
  const uri = '/settings/email';
  return emailApi.post(uri, {settings});
}


export const getWelcome = async () => {
  const uri = 'welcome';
  const result = await emailApi.get(uri);
  console.log('welcome result', result);
  return result.data;
}
export const postEmailTemplate = async (formData: UploadTemplateType) => {
  const form = new FormData();
  form.append(getDataFields.emailTemplateType, formData.emailTemplateType); //This needs to be first for backend preprocessing
  if (formData.file) {
    form.append(uploadHeaders.fileField, formData.file);
  }
  const config = {
    headers: {
      'content-type': 'multipart/form-data'
    }
  };
  return emailApi.post(`/settings/upload`, form, config)
}
