import {UploadFormatter} from "./UploadFormatter";
import {formatAuditItem, formatAuditLocation} from "./index";
import _ from "lodash";


export default class AuditScanFormatter extends UploadFormatter {
  format(responseData) {
    return {
      location: formatAuditLocation(responseData.location),
      matches: _.map(responseData.matches, r => formatAuditItem(r, true)),
      moved: _.map(responseData.moved, r => formatAuditItem(r, true)),
      expired: _.map(responseData.expired, r => formatAuditItem(r, true)),
      nomatches: _.map(responseData.nomatches, r => formatAuditItem(r, true)),
      missing: _.map(responseData.missing, r => formatAuditItem(r, true)),
    }
  }

}
