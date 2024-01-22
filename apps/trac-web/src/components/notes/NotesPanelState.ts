import {AuditNoteRecord, NullableString} from "@trac/datatypes";
import _ from "lodash";
export type NotesPanelDisplay = ('All' | 'Hide' | 'Audit' | 'Item');
export interface NotesPanelControls {
  display: NotesPanelDisplay;
  itemUuid: NullableString;
}
export default class NotesPanelState {
  public itemUuid: NullableString;
  public notes: AuditNoteRecord[];
  public display: NotesPanelDisplay;
  constructor(controls: NotesPanelControls) {
    this.notes = [];
    this.itemUuid = null;
    this.display = 'Hide'
    this.setDisplay(controls.display);
    this.selectItemNote(controls.itemUuid);
  }
  public setNotes(newNotes) {
    this.notes = [...newNotes];
  }
  public setDisplay(display) {
    // console.log(`Setting display to ${display}`)
    switch(display) {
      case 'Audit':
        this.display = this.hasAuditNotes() ? display : 'Hide';
        break;
      default:
        this.display = display;
    }
  }
  public selectItemNote(uuid = null as NullableString) {
    if(uuid) {
      this.display = 'Item';
    }
    this.itemUuid = uuid;
  }
  public setControls(controls: NotesPanelControls) {
  }
  public getControls() {
    return { display: this.display, itemUuid: this.itemUuid};
  }
  public hasAuditNotes() {
    return _.filter(this.notes, n => n.annotate_type === 'Audit').length > 0;
  }
  public getFilteredNotes() {
    switch(this.display) {
      case 'Item':
        if(this.itemUuid) {
          // console.log(`item filtered notes ${this.itemUuid} and display ${this.display}`);
          return _.filter(this.notes, n => n.annotate_type !== 'Audit' && n.annotated_uuid === this.itemUuid);
        }
        return [];
      case 'All':
        // console.log(`no filtering display ${this.display}`);
        return this.notes;
      case 'Audit':
        // console.log(`audit filtered notes display ${this.display}`);
        return _.filter(this.notes, n => n.annotate_type === 'Audit');
      case "Hide":
        // console.log(`hide notes display ${this.display}`);
        return [];
    }
  }
}
