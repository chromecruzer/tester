import {NoteCard} from "./NoteCard";
import _ from "lodash";
import {useEffect, useState} from "react";
import {useTracContext} from "../../TracContext";
import NotesPanelState, {NotesPanelControls} from "./NotesPanelState";
import NotesMapping from "./NotesMapping";

export const NotesPanel = ({audit}) => {
  const {getTracContext} = useTracContext();
  const notesDisplayControls = getTracContext('notesPanelControls') as NotesPanelControls;
  const notesPanelState = new NotesPanelState(notesDisplayControls);
  const notesMapping = new NotesMapping(audit);
  const [auditInfo, setAuditInfo] = useState(audit)

  useEffect(() => {
      setAuditInfo(audit);
  }, [audit]);
  notesPanelState.setNotes(auditInfo.notes)
  // console.log('all notes', notes)
  // console.log('notes to be displayed', notesPanelState.getFilteredNotes())
  return <div className='scrolledContainer-100 py-2 px-3 border-t-2 border-x-2 border-y-2 border-gray-400'>
    {_.map(notesPanelState.getFilteredNotes(), n => <NoteCard key={n.uuid} note={n} maps={notesMapping}/>)}
  </div>
}
