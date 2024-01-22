import {SearchTable} from "@trac/postgresql";

describe('SearchTable', () => {
  let searchTable, mockClient, mockSearchSignature;
  beforeEach(() => {
    mockClient = {
      query: jest.fn().mockReturnValue(Promise.resolve({rows: ['result1', 'result2']}))
    };
    searchTable = new SearchTable('test-schema-name');
    mockSearchSignature = {
      createSearchRecord: jest.fn().mockReturnValueOnce('searchField1')
        .mockReturnValueOnce('searchField2'),
      getSearchFields: jest.fn().mockReturnValue(['searchField1', 'searchField2']),
    };
    searchTable.searchSignatures['filled-table-schema-name.filled-table-name'] = mockSearchSignature;
  });
  describe('#createTable', () => {
    it('should create a search table correctly', () => {
      return searchTable.createTable(mockClient)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        })
    });
  });
  describe('fillTable', () => {
    it('should fill a table with search records correctly', () => {
      return searchTable.fillTable('filled-table-schema-name', 'filled-table-name', mockClient)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        })
    });

  });
  describe('search', () => {
    it('should return correctly formatted search results', () => {
      const expectedResults = [
        {
          schema: 'tracschema',
          tablename: 'customers',
          uuid: 'uuid1'
        },
        {
          schema: 'tracschema',
          tablename: 'customers',
          uuid: 'uuid2'
        },
        {
          schema: 'tracschema',
          tablename: 'customers',
          uuid: 'uuid3'
        },
        {
          schema: 'tracschema',
          tablename: 'products',
          uuid: 'uuid5'
        },
      ];
      const expectedCustomers = [
        {
          uuid: 'uuid1',
          customer_code: 'RES',
          name: 'efvwef1 - Pro',
        },
        {
          uuid: 'uuid2',
          customer_code: 'X RES',
          name: 'efvwef2 - Pro',
        },
        {
          uuid: 'uuid3',
          customer_code: 'RES1',
          name: 'efvwef3 - Pro',
        },
      ];
      const expectedProducts = [
        {
          uuid: 'uuid5',
          product_id: 'RES',
          description: 'PRO',
        },
      ];
      mockClient.query.mockReturnValueOnce(Promise.resolve({rows: expectedResults}))
        .mockReturnValueOnce(Promise.resolve({rows: expectedCustomers}))
        .mockReturnValueOnce(Promise.resolve({rows: expectedProducts}));
      return searchTable.search('pro', {consignments: true, products: false}, mockClient)
        .then(data => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
          expect(mockClient.query.mock.calls[1][0]).toMatchSnapshot();
          expect(mockClient.query.mock.calls[2][0]).toMatchSnapshot();
          expect(data).toMatchSnapshot();
        });
    });
  });
});
