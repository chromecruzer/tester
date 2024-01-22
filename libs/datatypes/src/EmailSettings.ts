import {NullableString} from "./datatypes";
import _ from "lodash";

export interface EmailServerSettings {
  batchSize: number;
  delayInSeconds: number;
  disableExpireEmails: boolean;
}

export interface EmailSettings {
  server: EmailServerSettings;
  ccSTM: boolean;
  ccPDM: boolean;
  ccKAE: boolean;
  missingHeader: EmailHeaderType;
  expiredHeader: EmailHeaderType;
}

export interface EmailHeaderType {
  subject: NullableString;
  sender: NullableString;
  attachmentTableName: NullableString;
}

export const initialEmailSettings: EmailSettings = {
  server: {
    batchSize: 1,
    delayInSeconds: 10,
    disableExpireEmails: true,
  },
  ccSTM: false,
  ccPDM: false,
  ccKAE: false,
  missingHeader: {
    subject: null,
    sender: null,
    attachmentTableName: 'Intraocular Lens (IOL) Inventory Audit - {Date}',
  },
  expiredHeader: {
    subject: null,
    sender: null,
    attachmentTableName: 'Expired List - {Date}',
  }
}
export type EmailTemplateType = ('Missing' | 'Expired');
export type MacroType = { [id: string]: string };

export interface EmailBatchOrder {
  cc: string;
  isRedirect: boolean;
  orders: EmailSendOrder[];
}

export interface EmailSendOrder {
  accountId?: NullableString;
  auditUuid?: NullableString;
  date: string;
  templateType: EmailTemplateType;
}

export interface DraftEmailType extends EmailSendOrder {
  tos: string[];
  ccs: string[];
  subject: string;
  sender: string;
  macros: string;
  html: string;
  expectedMacros: string[];
  pdfPath: string;
}

export interface MissingEmailsType {
  accountId: string;
  accountEmails: string[];
  salesEmails: string[];
  emailStatus: EmailStatusType
}

export type EmailStatusType = ('MISSING CUSTOMER' | 'MISSING SALES REP' | 'MISSING ALL' | null);
export const emailStatusFn = (accountEmails, salesEmails): EmailStatusType => {
  const isPopulated = array => _.isArray(array) && !_.isEmpty(array);
  switch (true) {
    case isPopulated(accountEmails) && isPopulated(salesEmails):
      return null;
    case isPopulated(accountEmails):
      return 'MISSING SALES REP';
    case isPopulated(salesEmails):
      return 'MISSING CUSTOMER';
    default:
      return 'MISSING ALL'
  }
}

