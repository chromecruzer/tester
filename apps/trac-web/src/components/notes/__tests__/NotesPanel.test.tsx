import {render, screen} from "@testing-library/react";
import _ from "lodash";
import {NotesPanel} from "../NotesPanel";
import * as NoteCardMock from '../NoteCard';

describe('NotesPanel', () => {
  let notes, mockNotesPanelState, mockNotesMapping;
  const renderNotesPanel = () => {
    render(<NotesPanel notesPanelState={mockNotesPanelState} maps={mockNotesMapping}/>)
  }
  beforeEach(() => {
    notes = [
      {
        uuid: 'note1',
        annotate_type: 'Audit',
        annotated_uuid: 'audit1'
      },
      {
        uuid: 'note2',
        annotate_type: 'Audit',
        annotated_uuid: 'audit2'
      },
      {
        uuid: 'note3',
        annotate_type: 'Item',
        annotated_uuid: 'item'
      },
      {
        uuid: 'note4',
        annotate_type: 'Match',
        annotated_uuid: 'item'
      },
      {
        uuid: 'note5',
        annotate_type: 'Item',
        annotated_uuid: 'other item'
      },
    ];
    mockNotesPanelState = {
      getNotes: jest.fn().mockImplementation(() => notes)
    };
    mockNotesMapping = 'notes mapping';
    jest.spyOn(NoteCardMock, 'NoteCard').mockImplementation(({note, maps}) =>
      <div>
        <h4>Note</h4><h4>{JSON.stringify(note)}</h4>
        <h4>Map</h4><h4>{maps}</h4>
      </div>)
  });
  it('should display a list of note cards', () => {
    renderNotesPanel();
    _.forEach(notes, n => {
      screen.getByText(JSON.stringify(n));
    })
  });
});
