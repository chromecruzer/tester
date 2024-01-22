import UploadStoreManagement from "../datastore/UploadStoreManagement";


export abstract class UploadCommitA {
  constructor(protected dataStore: UploadStoreManagement, protected schemaName: string) {
  }

  abstract commit(token, client);
}
