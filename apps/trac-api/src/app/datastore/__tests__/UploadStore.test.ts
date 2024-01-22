import FileStore from "../FileStore";

describe('FileStore', () => {
  let mockDsu, dataStore;
  beforeEach(() => {
    const storagePath = 'some/root/directory';
    mockDsu = {
      mkdir: jest.fn().mockReturnValue(Promise.resolve()),
      check: jest.fn().mockReturnValue(Promise.resolve(true)),
      remove: jest.fn().mockReturnValue(Promise.resolve()),
      store: jest.fn().mockReturnValue(Promise.resolve()),
      retrieve: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    dataStore = new FileStore(storagePath, 'session-token');
    dataStore.dsu = mockDsu;
  });
  describe('get', () => {
    it('should get the stored data', () => {
      const expected = {retrieved: 'json data'};
      mockDsu.retrieve.mockReturnValue(Promise.resolve(expected));
      return dataStore.get().then(actual => {
        expect(actual).toEqual(expected);
      })
    });
    it('should get the cached data', async () => {
      const expected = {retrieved: 'json data'};
      mockDsu.retrieve.mockReturnValue(Promise.resolve(expected));
      await dataStore.get(); // should also store in the cache.
      mockDsu.retrieve.mockReturnValue(Promise.resolve({not_retrieved:'json data'}));
      return dataStore.get().then(actual => {
        expect(actual).toEqual(expected);
      })
    });
  });
  describe('set', () => {
    it('should set both cached and stored', () => {
      const expected = {submitted: 'json data'};
      return dataStore.set(expected).then(() => {
        expect(dataStore.json).toEqual(expected);
        expect(mockDsu.store.mock.calls).toMatchSnapshot();
      })
    });
  });
  describe('remove', () => {
    it('should remove both stored and cached data', async () => {
      await dataStore.set({tobedeleted: 'json data'});
      return dataStore.remove().then(() => {
        expect(dataStore.json).toBeNull();
        expect(mockDsu.remove.mock.calls).toMatchSnapshot();
      })
    });
  });
});
