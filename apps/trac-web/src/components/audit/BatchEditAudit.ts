import {AuditLocationRecord, AuditMatch, dateNow, formatTracDate, UpdateAuditMatch} from "@trac/datatypes";
import _ from "lodash";
import {BatchEdit} from "../BatchEditA";

export default class BatchEditAudit extends BatchEdit {
  private account: AuditLocationRecord | undefined;
  private author: string | undefined;

  constructor() {
    super();
    this.uuids = [] as string[];
  }

  setAuthor(author) {
    this.author = author;
  }

  setAccount(account) {
    this.account = account;
  }

  matchChange(audit_match: AuditMatch): UpdateAuditMatch {
    return {
      items: this.uuids,
      match: audit_match,
      user: this.author || 'unknown',
    }
  }

  moved(moved_uuid, moved_code, warehouse): UpdateAuditMatch {
    return {
      items: this.uuids,
      match: 'Found In Other Location',
      user: this.author || 'unknown',
      uuid: moved_uuid,
      customerId: moved_code,
      warehouse,
    }
  }

  createItemNote(content, annotate_type) {
    console.log(`create note content for account`, this.account)
    return _.map(this.uuids, s => ({
      date_created: formatTracDate(dateNow()),
      author: this.author,
      annotate_type,
      annotated_uuid: s,
      audit_uuid: this.account?.uuid,
      content
    }))
  }
}
