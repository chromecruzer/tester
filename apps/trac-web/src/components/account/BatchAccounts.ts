import {BatchEdit} from "../BatchEditA";
import {AccountSummaryRecord, CustomerRecord, dateNow, formatTracDate} from "@trac/datatypes";
import _ from "lodash";

export default class BatchAccounts extends BatchEdit {
  private uuidMap: { [id: string]: AccountSummaryRecord };

  constructor() {
    super();
    this.uuidMap = {};
  }

  setUuidMap(map) {
    this.uuidMap = map;
  }
  getEmailSummary() {
    return `Sending ${this.filterUuids().length} out of ${this.uuids.length} selected`
  }
  private filterUuids() {
    return _.filter(this.uuids, uuid => {
      const rec = this.uuidMap[uuid];
      const expired = _.isNumber(rec.totalExpired) ? rec.totalExpired : 0
      return rec.missingEmails === null && expired > 0;
    });
  }
  sendEmailOrders() {
    return _.map(this.filterUuids(), uuid => {
      const accountId = this.uuidMap[uuid].customer_code;
      return {
        accountId,
        date: formatTracDate(dateNow()),
        templateType: 'Expired',
      }
    })
  }
}
