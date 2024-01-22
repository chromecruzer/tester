
import _ from 'lodash';
import util from "util";
import UploadStoreManagement from "../datastore/UploadStoreManagement";
import {TransformData} from "../datastore/TransformData";
import {UploadTransformerA} from "./UploadTransformerA";
import {NotificationsServer} from "@trac/postgresql";
import {InputDataTypeLabel, InputToSqlMapping} from "@trac/datatypes";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export class UploadDataTransformer extends UploadTransformerA {
  private transformData: TransformData;

  constructor(storeFactory: UploadStoreManagement, schemaName: string, tableName,
              private ns = null as (NotificationsServer | null)) {
    super(storeFactory, schemaName, tableName);
    this.transformData = new TransformData(schemaName, tableName, ns);
  }
  async transform(uploadedData: InputDataTypeLabel[][], mapping: InputToSqlMapping[], client, token: string) {
    const json = await this.transformData.transform(this.transformData.convertSpreadsheetRecords(uploadedData, mapping), client)
    return this.storeFactory.create(token, json);
  }
}
