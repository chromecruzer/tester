import UploadDataFormatter from "./UploadDataFormatter";
import {DateTime} from "luxon";
import {formatTracDate, tracDateFormat} from "@trac/datatypes";
import {createUuid} from "./index";

export default class UploadIolDataFormatter extends UploadDataFormatter {
  protected override formatDataRow(row, addUuid = false) {
    const result = {...row};
    if (addUuid) {
      result.uuid = createUuid();
    }
    result.shipped_date = formatTracDate(row.shipped_date);
    result.received_date = formatTracDate(row.received_date);
    result.expire_date = formatTracDate(row.expire_date);
    return result;
  }
}
