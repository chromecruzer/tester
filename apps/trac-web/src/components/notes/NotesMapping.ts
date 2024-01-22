import _ from "lodash";
import {AuditItemRecord, AuditNoteRecord} from "@trac/datatypes";
type NotesMap = {[id: string]: AuditNoteRecord[]};
export default class NotesMapping {
  private notesMap: NotesMap;
  private itemMap: { [id: string]: AuditItemRecord };
  private auditNotes = [] as AuditNoteRecord[];
  constructor(audit) {
    this.notesMap = _.reduce(audit.notes, (accum, noteRecord: AuditNoteRecord) => {
      if(noteRecord.annotate_type === 'Audit') {
        this.auditNotes.push(noteRecord);
        return accum;
      }
      let entry = accum[noteRecord.annotated_uuid as string];
      if(!_.isArray(entry)) {
        accum[noteRecord.annotated_uuid as string] = [];
        entry = accum[noteRecord.annotated_uuid as string];
      }
      entry.push(noteRecord);
      return accum;
    }, {} as NotesMap );
    this.itemMap = _.reduce(audit.items, (accum, item) => {
      accum[item.uuid] = item;
      return accum;
    }, {})
  }
  getNotes(uuid) {
    return this.notesMap[uuid];
  }
  getItem(uuid) {
    return this.itemMap[uuid];
  }
  getFlattenedAuditNotes(auditHeader) {
    return _.map(this.auditNotes, an => {
      const result = {};
      result[auditHeader] = this.flattenNote(an);
      return result;
    })
  }
  extractItemsWithNotes() {
    return _.map(this.itemMap, (v, k) => {
      const notes = _.reduce(this.getNotes(v.uuid), (accum, n) => {
        accum += `${this.flattenNote(n)}
        `;
        return accum;
      },'');
      return {...v, notes}
    })
  }
  private flattenNote(note) {
    return `${note.content} by ${note.author} on ${note.date_created}`;
  }
}
