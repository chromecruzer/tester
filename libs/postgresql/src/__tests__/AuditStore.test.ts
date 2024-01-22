import {AuditStore} from "@trac/postgresql";
import * as Datatypes from "@trac/datatypes"
import {DateTime} from "luxon";
import {tracDateFormat} from "@trac/datatypes";
describe('AuditStore', () => {
  let store, mockClient;
  beforeEach(() => {
    store = new AuditStore('name of the schema');
    mockClient = {
      query: jest.fn().mockReturnValue(Promise.resolve())
    };
    jest.spyOn(DateTime, 'now').mockImplementation(() => DateTime.fromFormat('07/20/2022',tracDateFormat))
  });
  describe('storeNotes', () => {
    let oneNote, multipleNotes;
    beforeEach(() => {
      oneNote = {
        date_created: '07/04/2022',
        author: 'Dickens',
        annotate_type: 'Item',
        annotated_uuid: 'uuid-of-the-note-target',
        audit_uuid: 'uuid-of-the-audit',
        content: `note that show the content
        with an embedded`
      }
      multipleNotes = [
        {
          date_created: '07/04/2022',
          author: 'Dickens',
          annotate_type: 'Item',
          annotated_uuid: 'uuid-of-the-note-target',
          audit_uuid: 'uuid-of-the-audit',
          content: `note that show the content
        with an embedded return`
        },
        {
          date_created: '07/11/2022',
          author: 'Shakespeare',
          annotate_type: 'Audit',
          annotated_uuid: 'uuid-of-the-note-target2',
          audit_uuid: 'uuid-of-the-audit2',
          content: `note that show the content`
        },
        {
          date_created: '07/04/2022',
          author: 'Verne',
          annotate_type: 'Match',
          annotated_uuid: 'uuid-of-the-note-target3',
          audit_uuid: 'uuid-of-the-audit3',
          content: `note that show the content
        with an embedded
        returns`
        },
      ];
    });
    it('should store one note correctly', () => {
      return store.storeNotes([oneNote], mockClient)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        });
    });
    it('should store multiple notes correctly', () => {
      store.storeNotes(multipleNotes, mockClient)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        });
    });
  });
  describe('updateItems', () => {
    it('should update one audit item correctly', () => {
      store.updateItems(['uuid1'], 'Billed', 'Nutall', mockClient, null, null, warehouse)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        });
    });
    it('should update multiple audit items correctly', () => {
      store.updateItems(['uuid1', 'uuid2', 'uuid3'], 'Billed', 'Nutall', mockClient, null, null, warehouse)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        });
    });
    it('should update multiple audit items with consignment location correctly', () => {
      store.updateItems(['uuid1', 'uuid2', 'uuid3'], 'Found In Another Location', 'Nutall', mockClient, 'uuid of the consignment', 'location of the consignment', warehouse)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        });
    });
  });
});
