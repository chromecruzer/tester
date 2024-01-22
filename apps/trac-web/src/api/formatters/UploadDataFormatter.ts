import {UploadFormatter} from "./UploadFormatter";
import {createUuid} from "./index";

export default class UploadDataFormatter extends UploadFormatter {
  format(responseData) {
    console.log(`formatting upload response `, responseData);
    return {
      adds: responseData.adds.map(r => this.formatDataRow(r, true)),
      exists: responseData.exists.map(r => this.formatDataRow(r, false))
    };
  }
  protected formatDataRow(row, addUuid = false) {
    if(addUuid) {
      return ({
        ...row,
        uuid: createUuid(),
      });
    }
    return row;
  }
}
