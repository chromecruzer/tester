import StoreAuditNoteOrItem from "../StoreAuditNoteOrItem";

describe('StoreAuditNoteOrItem', () => {
  let mockPostgresClient, mockAuditStore, store;
  beforeEach(() => {
    mockPostgresClient = {
      getClient: jest.fn().mockImplementation(() => Promise.resolve('passed client')),
      release: jest.fn()
    };
    mockAuditStore = {
      storeNotes: jest.fn().mockImplementation(() => Promise.resolve('storing notes')),
      updateItems: jest.fn().mockImplementation(() => Promise.resolve('updating items')),
    };
    store = new StoreAuditNoteOrItem('audit schema');
    store.auditStore = mockAuditStore;
  });
  describe('storeNotes', () => {
    it('should update note records correctly', () => {
      const storeNotes = store.storeNotes(mockPostgresClient);
      return storeNotes({body: 'these are my notes'}, 'response', jest.fn())
        .then(() => {
          expect(mockPostgresClient.getClient).toBeCalled();
          expect(mockPostgresClient.release).toBeCalled();
          expect(mockAuditStore.storeNotes).toBeCalledWith('these are my notes', 'passed client')
        })
    });
  });
  describe('updateItems', () => {
    it('should update audit item records correctly', () => {
      const updateItems = store.updateItems(mockPostgresClient);
      return updateItems({body: {
          items: 'items',
          match: 'whatta match',
          user: 'I`m the user',
        }}, 'response', jest.fn())
        .then(() => {
          expect(mockPostgresClient.getClient).toBeCalled();
          expect(mockPostgresClient.release).toBeCalled();
          expect(mockAuditStore.updateItems).toBeCalledWith('items', 'whatta match', 'I`m the user',
            'passed client', null, null)
        })
    });
    it('should update audit item records correctly with an uuid', () => {
      const updateItems = store.updateItems(mockPostgresClient);
      return updateItems({body: {
          items: 'items',
          match: 'whatta match',
          user: 'I`m the user',
          uuid: 'uuid1',
        }}, 'response', jest.fn())
        .then(() => {
          expect(mockPostgresClient.getClient).toBeCalled();
          expect(mockPostgresClient.release).toBeCalled();
          expect(mockAuditStore.updateItems).toBeCalledWith('items', 'whatta match', 'I`m the user',
            'passed client', 'uuid1', null)
        })
    });
    it('should update audit item records correctly with a customerId', () => {
      const updateItems = store.updateItems(mockPostgresClient);
      return updateItems({body: {
          items: 'items',
          match: 'whatta match',
          user: 'I`m the user',
          customerId: 'a customer',
        }}, 'response', jest.fn())
        .then(() => {
          expect(mockPostgresClient.getClient).toBeCalled();
          expect(mockPostgresClient.release).toBeCalled();
          expect(mockAuditStore.updateItems).toBeCalledWith('items', 'whatta match', 'I`m the user',
            'passed client', null, 'a customer');
        })
    });
  });
});
