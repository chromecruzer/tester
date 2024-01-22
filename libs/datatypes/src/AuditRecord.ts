import {DateTime} from "luxon";
import _ from "lodash";
import {dateCompare, dateToTimestamp, NullableDate, NullableString, tracDateFormat} from "./datatypes";


export const auditMatch = [
  'True Match',
  'Found In Other Location',
  'Billed',
  'No Match',
  'Missing',
  'Other',
];
export type AuditMatch = (
  'True Match' |
  'Found In Other Location' |
  'Billed' |
  'No Match' |
  'Missing' |
  'Other'
  );

export const unresolvedAuditItem = (auditItem) => auditItem.audit_match === 'Missing' || auditItem.audit_match === 'No Match';
export interface AuditItemRecord {
  uuid?: string;
  lot: string;
  item?: string,
  consignment_uuid?: string;
  consignment_location?: string;
  consignment_warehouse?: string,
  family?: string;
  description?: string;
  expire_date?: Date;
  audit_match: AuditMatch;
  audit_uuid?: string;
  quantity?: number;
  last_changed_date: Date;
  confirmed_date?: Date;
  confirmed_by?: string;
}
export interface AuditItemTableRecord extends AuditItemRecord {
  expire_status?: string,
  confirm_status: boolean,
}
export interface AuditItemWithNote extends AuditItemRecord {
  notes?: string;
}
export interface UpdateAuditMatch {
  items: string[];
  match: AuditMatch;
  user: string;
  uuid?: string;
  customerId?: string;
  warehouse?: string;
}
export const sqlAuditItemRecord = {
  uuid: 'UUID unique',
  lot: 'varchar(20)',
  consignment_uuid: 'UUID',
  consignment_location: 'varchar(8)',
  consignment_warehouse: 'varchar(8)',
  item: 'varchar(20)',
  family: 'varchar(30)',
  description: 'varchar(30)',
  expire_date: 'date',
  audit_match: 'varchar(30)',
  audit_uuid: 'UUID',
  quantity: 'integer',
  last_changed_date: 'date',
  confirmed_date: 'date',
  confirmed_by: 'varchar(100)'
}
export const initialAuditLocationRecord: AuditLocationRecord = {
  uuid: '',
  received_date: DateTime.now().toFormat(tracDateFormat),
  location_code: '',
  scan_date: DateTime.now().toFormat(tracDateFormat),
  close_date: null as NullableString,
  status: null,
  auditor: '',
  scanner: ''
}
export type AuditStatusType = ('OPEN' | 'CLOSED' | 'CHECKIN' | null);
export interface AuditLocationRecord {
  uuid: string;
  received_date: string;
  location_code: string;
  name?: string;
  scan_date: string;
  close_date: NullableString;
  status: AuditStatusType;
  auditor: string;
  scanner: string;
  unresolved?: number;
}
export interface LatestAudit {
  status:AuditStatusType;
  date: NullableString;
  dateTime?: DateTime;
  uuid: string;
  unresolved?: number;
}

export const sqlAuditLocationRecord = {
  uuid: 'UUID unique',
  received_date: 'date',
  location_code: 'varchar(8)',
  scan_date: 'date',
  close_date: 'date',
  status: 'varchar(8)',
  auditor: 'varchar(100)',
  scanner: 'varchar(100)'
};
export interface UploadAuditDetails {
  location: AuditLocationRecord,
  matches: AuditItemRecord[],
  moved: AuditItemRecord[],
  nomatches: AuditItemRecord[],
  missing: AuditItemRecord[],
}

export type AnnotateTypes = ('Audit' | 'Item' | 'Match');

export const annotateTypes = [
  'Audit',
  'Item',
  'Match',
];

export interface AuditNoteRecord {
  uuid?: string;
  date_created: string;
  author: string;
  annotate_type: AnnotateTypes;
  annotated_uuid?: string;
  audit_uuid: string;
  content: string;
}

export const sqlAuditNoteRecord = {
  uuid: 'UUID unique',
  date_created: 'date',
  author: 'varchar(100)',
  annotate_type: 'varchar(12)',
  annotated_uuid: 'UUID',
  audit_uuid: 'UUID',
  content: 'varchar(500)'
}
export interface AuditRecord {
  location: AuditLocationRecord;
  items: AuditItemRecord[];
  notes: AuditNoteRecord[];
}
export const auditRecordFromJson = (record) => {
  const result = _.cloneDeep(record);
  result.location.scan_date = new Date(record.location.scan_date);
  result.items = _.map(record.items, i => {
    i.expire_date = i.expire_date ? new Date(i.expire_date) : null;
    i.last_changed_date = i.last_changed_date ? new Date(i.last_changed_date) : null;
    i.confirmed_date = i.confirmed_date ? new Date(i.confirmed_date) : null;
    return i;
  });
  result.notes = _.map(record.notes, n => {
    n.date_created = new Date(record.date_created);
    return n;
  })
  return result;
}
export const auditTableColumns = [
  {
    header: 'Serial Number',
    accessor: 'lot',// tooltip with item notes
  },
  {
    header: 'Audit Status',
    accessor: 'audit_match', //tooltip with match notes
  },
  {
    header: 'Item',
    accessor: 'item',
  },
  {
    header: 'Family',
    accessor: 'family',
  },
  {
    header: 'Description',
    accessor: 'description',
  },
  {
    header: 'Expires By',
    accessor: 'expire_date',
    sortingFn: dateCompare,
    sortConvertFn: dateToTimestamp,
  },
  {
    header: 'Expire Status',
    accessor: 'expire_status',
  },
  {
    header: 'Other Location',
    accessor: 'consignment_location', // tooltip with address
  },
  {
    header: 'Other Warehouse',
    accessor: 'consignment_warehouse', // tooltip with address
  },
];
