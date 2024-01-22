import UploadStoreManagement from "../datastore/UploadStoreManagement";
import {UploadAnalysisA} from "./UploadAnalysisA";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class UploadDataAnalysis extends UploadAnalysisA {
  constructor(dataStore: UploadStoreManagement, schemaName, tableName) {
    super(dataStore, schemaName, tableName);

  }
  async comparisons(session) {
    const comparisons = await this.dataStore.retrieve(session);
    return comparisons ? {
      adds: comparisons.adds.length,
      exists: comparisons.exists.length,
    } : null;
  }
}
