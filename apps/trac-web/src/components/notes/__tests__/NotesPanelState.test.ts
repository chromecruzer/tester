import NotesPanelState from "../NotesPanelState";
import _ from "lodash";

describe('NotesPanelState', () => {
  let notes, state;
  beforeEach(() => {
    notes = [
      {
        annotate_type: 'Audit',
        annotated_uuid: 'audit1'
      },
      {
        annotate_type: 'Audit',
        annotated_uuid: 'audit2'
      },
      {
        annotate_type: 'Item',
        annotated_uuid: 'item'
      },
      {
        annotate_type: 'Match',
        annotated_uuid: 'item'
      },
      {
        annotate_type: 'Item',
        annotated_uuid: 'other item'
      },
    ];
    state = new NotesPanelState();
  });
  describe('setNotes', () => {
    it('should set the notes', () => {
      state.setNotes(notes);
      expect(state.notes).toEqual(notes);
    });
  });
  describe('setDisplay', () => {
    it('should set the display state correctly', () => {
      expect(state.display).toEqual('Hide');
      state.setDisplay('All');
      expect(state.display).toEqual('All');
    });
  });
  describe('itemFilter', () => {
    it('should set uuid', () => {
      expect(state.itemUuid).toBeNull();
      state.itemFilter('item');
      expect(state.itemUuid).toEqual('item');
    });
    it('should set the display to Item when there is a uuid', () => {
      expect(state.itemUuid).toBeNull();
      state.itemFilter('item');
      expect(state.itemUuid).toEqual('item');
      expect(state.display).toEqual('Item');
      state.setNotes(notes);
      state.setDisplay('Audit');
      state.itemFilter(null);
      expect(state.itemUuid).toBeNull();
      expect(state.display).toEqual('Audit');
    });
  it('should set the display not display audit notes if their are none', () => {
    state.setNotes(_.filter(notes, n => n.annotate_type !== 'Audit'));
    state.setDisplay('Audit');
    state.itemFilter(null);
    expect(state.itemUuid).toBeNull();
    expect(state.display).toEqual('Hide');
  });
});
  describe('getNotes', () => {
    it('should filter notes by item', () => {
      state.setNotes(notes);
      state.itemFilter('item');
      const actual = state.getNotes();
      expect(actual).toMatchSnapshot();
    });
    it('should return all notes if specified', () => {
      state.setNotes(notes);
      state.setDisplay('All');
      const actual = state.getNotes();
      expect(actual).toMatchSnapshot();
    });
    it('should return only audit notes', () => {
      state.setNotes(notes);
      state.setDisplay('Audit');
      const actual = state.getNotes();
      expect(actual).toMatchSnapshot();
    });
    it('should return an empty array when hidden', () => {
      state.setNotes(notes);
      const actual = state.getNotes();
      expect(actual).toEqual([]);
    });
  });
});
