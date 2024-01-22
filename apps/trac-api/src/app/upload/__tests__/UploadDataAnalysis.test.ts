import UploadDataAnalysis from "../UploadDataAnalysis";

describe('UploadDataAnalysis', () => {
  let clientMock, analysis, originals, updated, modifies, dataStore;
  beforeEach(() => {
    clientMock = {
      query: jest.fn(),
    };
    dataStore = {
      retrieve: jest.fn()
    }
    clientMock.query.mockImplementation(() => Promise.resolve());
    analysis = new UploadDataAnalysis(dataStore, 'schema-name', 'table-name');
    originals = {
      same: {
        lot: 'lott1223'
      },
      modified: {
        lot: 'lott1225'
      },
      removed: {
        lot: 'lott1226'
      },
    };
    updated = [
      [
        'lot1223',
      ],
      [
        'lot1225',
      ],
      [
        'lot1227',
      ],
    ];
    modifies = [
      {
        new: {
          uuid: "modified",
          lot: "lot1225",
        },
        originalUuid: "modified",
      },
    ];
  });
  describe('#analytics', () => {
    it('should return the correct length calculations', () => {
      dataStore.retrieve.mockImplementation(() =>
        ({adds: updated, modifies, removedUuids: ['removed']}))
      return analysis.analytics().then(actual => {
        expect(actual).toMatchSnapshot();
      });
    });
  });
  describe('#details', () => {
    it('should return list of added, modified, and removed records', () => {
      dataStore.retrieve.mockImplementation(() =>
        ({adds: updated, modifies, removedUuids: ['removed']}));
      jest.spyOn(analysis, 'getOriginals').mockImplementation(() => [{uuid: 'removed'}]);
      jest.spyOn(analysis, 'getModifications').mockImplementation(() => modifies);
      return analysis.details(clientMock).then(actual => {
        expect(actual).toMatchSnapshot();
      });
    });
  });
  describe('#getOriginals', () => {
    it('should create correct sql to get records based on a list uuids', () => {
      clientMock.query.mockReturnValue(Promise.resolve({rows: []}));
      return analysis.getOriginals(['uuid01', 'uuid02', 'uuid03'], clientMock).then(() => {
        expect(clientMock.query.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
  describe('#getModifications', () => {
    it('should fills in the modifies portion of comparisons correctly', () => {
      jest.spyOn(analysis, 'getOriginals').mockImplementation(() => {
        return Promise.resolve(originals);
      });
      return analysis.getModifications({modifies}, clientMock)
        .then(result => {
          expect(result).toMatchSnapshot();
        });
    });
  });
});
