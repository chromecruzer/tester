import {render, screen} from "@testing-library/react";
import {NoteCard} from "../NoteCard";

describe('NoteCard', () => {
  let note, anotherNote;
  const renderNoteCard = note => {
    render(<NoteCard note={note}
                     maps={{getItem: jest.fn()
                         .mockImplementation(() => ({lot: 'this is my lot'}))}}/>)
  }
  beforeEach(() => {
    note = {
      annotate_type: 'Item',
      annotated_uuid: 'item',
      author: 'Beethoven',
      date_created: '2022/07/04',
      content:'Das ist einen Note'
    };
    anotherNote = {
      annotate_type: 'Audit',
      annotated_uuid: 'audit',
      author: 'Beethoven',
      date_created: '2022/07/04',
      content:'Das ist einen Note\\nIch hab es geschriebt'
    };
  });
  it('should display a note', () => {
    renderNoteCard(note);
    screen.getByText('Das ist einen Note');
  });
  it('should display a multiline note', () => {
    renderNoteCard(anotherNote);
    screen.getByText('Das ist einen Note');
    screen.getByText('Ich hab es geschriebt');
  });
  it('should display annotated item', () => {
    renderNoteCard(note);
    screen.getByText('this is my lot');
  });
  it('should display annotated item', () => {
    renderNoteCard(anotherNote);
    screen.getByText('Audit');
  });
  it('should display the note`s author', () => {
    renderNoteCard(note);
    screen.getByText('Beethoven');
  });
  it('should display the date the note was created', () => {
    renderNoteCard(note);
    screen.getByText('2022/07/04');
  });
});
