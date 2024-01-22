import {v4 as uuidv4} from 'uuid';
import {formatTracDate, UploadSupportedFileTypes} from "@trac/datatypes";
import AuditScanFormatter from "./AuditScanFormatter";
import UploadIolDataFormatter from "./UploadIolDataFormatter";
import UploadDataFormatter from "./UploadDataFormatter";
import _ from "lodash";

export const formatAuditItem = (row, needCreateUuid = false) => {
  const result = {...row};
  result.uuid = needCreateUuid ? createUuid() : row.uuid;
  result.shipped_date = _.isString(row.shipped_date) ? formatTracDate(row.shipped_date) : null;
  result.received_date = _.isString(row.received_date) ? formatTracDate(row.received_date) : null;
  result.expire_date = _.isString(row.expire_date) ? formatTracDate(row.expire_date) : null;
  return result;
}
export const formatAuditNote = note => {
  const result = {...note};
  result.date_created = _.isString(note.date_created) ? formatTracDate(note.date_created) : null;
  return result;
}
export const formatAuditLocation = location => {
   // console.log(`formatting location`, location);
  return {
    ...location,
    received_date: _.isString(location.received_date) ? formatTracDate(location.received_date) : null,
    scan_date: _.isString(location.scan_date) ? formatTracDate(location.scan_date) : null,
    close_date: _.isString(location.close_date) ? formatTracDate(location.close_date) : null,
  };
}

const uploadFormatters = {
  upload_audit_scans: new AuditScanFormatter(),
  upload_iol_report: new UploadIolDataFormatter(),
  upload_customer_data: new UploadDataFormatter(),
  upload_customer_contact_data: new UploadDataFormatter(),
  upload_product_data: new UploadDataFormatter(),
  upload_sales_mapping_data: new UploadDataFormatter(),
  upload_sales_rep_data: new UploadDataFormatter(),
};
export const getUploadFormatter = (type: (UploadSupportedFileTypes | null)) => {
  if (type === null) {
    return new AuditScanFormatter();
  }
  const formatter = uploadFormatters[`upload_${type}`] || null;
  if(formatter) {
    return formatter;
  }
  console.error(`Formatter not found for file type ${type}`);
  return null;
}
export const createUuid = (testing = false) => {
  if (testing) {
    return 'I am a created uuid';
  }
  return uuidv4();
}
