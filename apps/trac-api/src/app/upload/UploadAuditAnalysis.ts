import {UploadAnalysisA} from "./UploadAnalysisA";
import {auditRecordFromJson, UploadAuditDetails} from "@trac/datatypes";
import util from "util";
import _ from "lodash";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class UploadAuditAnalysis extends UploadAnalysisA {
  public async comparisons(session) {
    return this.dataStore.retrieve(session)
      .then(auditRecord => auditRecordFromJson(auditRecord))
      .then(auditRecord => {
        // console.log(`retrieved audit record ${dump(auditRecord)}`);
        return auditRecord ? {
          location: auditRecord.location,
          matches: auditRecord.items.filter(i => i.audit_match === 'True Match'),
          moved: auditRecord.items.filter(i => i.audit_match === 'Found In Other Location'),
          nomatches: auditRecord.items.filter(i => i.audit_match === 'No Match'),
          missing: auditRecord.items.filter(i => i.audit_match === 'Missing'),
        } as UploadAuditDetails : null;
      })
      .catch(err => {
        throw new Error(`Session ${session} not found ${dump(err)}`);
      });
  }
}
