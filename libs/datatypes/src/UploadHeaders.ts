import {IolRecord, iolTableColumns} from "./IolRecord";
import {AuditRecord} from "./AuditRecord";
import {CustomerContactRecord, customerContactTableColumns} from "./CustomerContactRecord";
import {CustomerRecord} from "./CustomerRecord";
import {ProductRecord} from "./ProductRecord";
import {SalesRepRecord} from "./SalesRepRecord";
import {SalesMappingRecord} from "./SalesMappingRecord";
import {SalesJumpRecord} from "./SalesJumpRecord";

export type UploadRecord = (IolRecord | CustomerRecord | CustomerContactRecord | ProductRecord | SalesMappingRecord |
  SalesRepRecord | SalesJumpRecord);

export interface UploadHeadersType {
  tokenHeader: string;
  fileField: string;
  userField: string;
  typeField: string;
  scannerField: string;
  locationField: string;
  scanDateField: string;
  isSetField: string;
}

const uploadHeaders: UploadHeadersType = {
  tokenHeader: 'upload_token',
  fileField: 'uploadFile',
  userField: 'user',
  typeField: 'type',
  scannerField: 'scanner',
  scanDateField: 'scan_date',
  locationField: 'location_code',
  isSetField: 'is_set',
}
export interface Comparisons {
  adds: UploadRecord[];
  exists: UploadRecord[];
}
export type UploadAnalytics = (Comparisons | AuditRecord);


export interface ArchiveUploadData {
  adds: string[],
  exists: string[],
}

export interface UploadMetadata {
  name?: string;
  type: UploadSupportedFileTypes;
  date: Date;
  user: string;
}
export type DataUploadTypes = ('iol_report' | 'customer_data' | 'customer_contact_data' | 'sales_rep_data'
  | 'sales_mapping_data' | 'product_data' | 'refresh_data');
export type UploadSupportedFileTypes =
  ('audit_scans' | 'iol_report' | 'customer_data' | 'customer_contact_data' | 'sales_rep_data'
    | 'sales_mapping_data' | 'product_data' | 'refresh_data');
export const detailsTableColumns = {
  'iol_report': iolTableColumns,
  'customer_contact_data': customerContactTableColumns,
}
export const supportedUploadFiles = () => Object.keys(detailsTableColumns);

export interface UploadSessionToken {
  session: string;
  type: UploadSupportedFileTypes;
}

export {uploadHeaders};

