import UploadStoreManagement from "../datastore/UploadStoreManagement";
import {UploadCommitA} from "./UploadCommitA";
import util from "util";
import {TransformData} from "../datastore/TransformData";
import {NotificationsServer} from "@trac/postgresql";
import ScheduleBatches from "../emails/ScheduleBatches";
import {dataTableNames} from "@trac/datatypes";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
export class UploadDataCommit extends UploadCommitA {
  private transformData: TransformData;

  constructor(dataStore: UploadStoreManagement, schemaName: string, private tableName: string,
              private scheduler = null as (ScheduleBatches | null),
              private ns = null as (NotificationsServer | null)) {
    super(dataStore, schemaName);
    this.transformData = new TransformData(schemaName, tableName, ns);
  }

  public async commit(token, client) {
    if(this.scheduler) {
      this.scheduler.clearMissingEmailAddresses();
    }
    const data = await this.dataStore.retrieve(token);
    if (data === null) {
      if (this.ns) {
        this.ns.notify('ERROR', `commit failed`,
          `data for ${token} could not be found`, ['iolUpload'])
      }
      throw new Error(`commit failed because data could not be found`);
    }
    return this.transformData.storeInDb(data, client);
  }
}
