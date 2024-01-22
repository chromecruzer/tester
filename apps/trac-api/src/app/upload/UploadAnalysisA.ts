import UploadStoreManagement from "../datastore/UploadStoreManagement";
import {Comparisons, UploadAuditDetails} from "@trac/datatypes";

export abstract class UploadAnalysisA {
  constructor(protected dataStore: UploadStoreManagement, protected schemaName, protected tableName) {
  }

  abstract comparisons(session): Promise<(Comparisons | UploadAuditDetails)>;
}
