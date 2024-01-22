import UploadStoreManagement from "../datastore/UploadStoreManagement";

export abstract class UploadTransformerA {
  constructor(protected storeFactory: UploadStoreManagement, protected schemaName: string, protected tableName) {
  }

  public abstract transform(uploadedData: any[], client, token: string, form?): Promise<void>;
}
