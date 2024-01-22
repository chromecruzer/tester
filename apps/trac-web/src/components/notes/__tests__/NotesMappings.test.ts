import NotesMapping from "../NotesMapping";

describe('NotesMapping', () => {
  let notes, items, mappings;
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
    items = [
      {
        uuid: 'item',
        lot: 'this is an item'
      },
      {
        uuid: 'other item',
        lot: 'this the other item'
      }
    ];
    mappings = new NotesMapping({location: 'timbuktoo', notes, items});
  });
  it('should fill out maps correctly', () => {
    expect(mappings.itemMap).toMatchSnapshot();
    expect(mappings.notesMap).toMatchSnapshot();
  });
  describe('getNotes', () => {
    it('should get notes for a specified item', () => {
      let actual = mappings.getNotes('other item');
      expect(actual).toMatchSnapshot();
      actual = mappings.getNotes('item');
      expect(actual).toMatchSnapshot();
    });
  });
  describe('getItem', () => {
    it('should get a specified item', () => {
      const actual = mappings.getItem('other item');
      expect(actual).toMatchSnapshot();
    });
  });
});
