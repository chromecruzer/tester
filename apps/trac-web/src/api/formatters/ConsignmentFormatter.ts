import _ from "lodash";
import {UploadFormatter} from "./UploadFormatter";
import {formatTracDate} from "@trac/datatypes";

export default class ConsignmentFormatter extends UploadFormatter {
  format(responseData) {
    return _.map(responseData, h => this.formatConsignmentRow(h))
  }

  formatConsignmentRow(row) {
    return {
      ...row,
      expire_date: formatTracDate(row.expire_date),
    };
  }

}
