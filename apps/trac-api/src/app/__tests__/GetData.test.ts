import GetData from "../GetData";
import {queryRecords} from '@trac/postgresql';

jest.mock('@trac/postgresql');
describe('GetData', () => {
  let getDataModel, mockClient, mockPostgresClient, postgresConfigFactory, searchResults, cleanedResults,
    mockQueryRecords;
  beforeEach(() => {
    mockQueryRecords = jest.mocked(queryRecords).mockReturnValue(Promise.resolve(['data1', 'data2']));
    searchResults = ['raw', 'version'];
    cleanedResults = ['cleaned', 'version'];
    postgresConfigFactory = {
      getSchemaName: () => 'schemanameFromConfig'
    }
    getDataModel = new GetData(postgresConfigFactory, 'consignmentTable',
      'customerTable');
    getDataModel.searchTable.search = jest.fn().mockReturnValue(Promise.resolve(searchResults));
    getDataModel.searchTable.uniquify = jest.fn().mockReturnValue(cleanedResults);
    mockClient = {
      query: jest.fn()
    }
    mockPostgresClient = {
      getClient: jest.fn().mockReturnValue(Promise.resolve(mockClient)),
      release: jest.fn()
    };
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('search', () => {
    let searchFunc;
    beforeEach(() => {
      searchFunc = getDataModel.search(mockPostgresClient);
    });
    it('should call search table without filters correctly', () => {
      const res = {json: jest.fn()};
      return searchFunc({body: {searchText: 'text2Search'}}, res, jest.fn()).then(() => {
        expect(getDataModel.searchTable.search).toBeCalledWith('text2Search', undefined, mockClient);
        expect(getDataModel.searchTable.uniquify).toBeCalledWith(searchResults);
        expect(res.json).toBeCalledWith(cleanedResults);
      });
    });
    it('should call search table with filters correctly', () => {
      const res = {json: jest.fn()};
      return searchFunc({body: {searchText: 'text2Search', filters:{consignments: true, customers: true}}}, res, jest.fn()).then(() => {
        expect(getDataModel.searchTable.search).toBeCalledWith('text2Search',
          {consignments: true, customers: true}, mockClient);
        expect(getDataModel.searchTable.uniquify).toBeCalledWith(searchResults);
        expect(res.json).toBeCalledWith(cleanedResults);
      });
    });
    it('should create and release a client with success', () => {
      const res = {json: jest.fn()};
      return searchFunc({body: {searchText: 'text2Search'}}, res, jest.fn()).then(() => {
        expect(mockPostgresClient.getClient).toBeCalled();
        expect(mockPostgresClient.release).toBeCalledWith(mockClient);
      });
    });
    it('should create and release a client with failure', () => {
      getDataModel.searchTable.search = jest.fn().mockReturnValue(Promise.reject('i am not playing your game'));
      const res = {json: jest.fn()};
      return searchFunc({body: {searchText: 'text2Search'}}, res, jest.fn()).finally(() => {
        expect(mockPostgresClient.getClient).toBeCalled();
        expect(mockPostgresClient.release).toBeCalledWith(mockClient);
      });
    });
  });
  describe('getConsignments', () => {
    it('should query with the proper SQL when called with a customer ID', () => {
      const actualFunc = getDataModel.getConsignments(mockPostgresClient);
      mockClient.query.mockReturnValue(Promise.resolve({rows: ['data']}));
      return actualFunc({params: {customerId: 'idForCustomer'}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
      });
    });
    it('should query with the proper SQL when called without a customer ID', () => {
      const actualFunc = getDataModel.getConsignments(mockPostgresClient);
      mockClient.query.mockReturnValue(Promise.resolve({rows: ['data']}));
      return actualFunc({params: {}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
  describe('getCustomers', () => {

    it('should query with the proper SQL when called with a customer uuid', () => {
      const actualFunc = getDataModel.getCustomers(mockPostgresClient);
      mockClient.query.mockReturnValue(Promise.resolve({rows: ['data']}));
      return actualFunc({params: {uuid: 'uuidForCustomer'}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockQueryRecords.mock.calls).toMatchSnapshot();
      });
    });
    it('should query with the proper SQL when called without a customer uuid', () => {
      const actualFunc = getDataModel.getCustomers(mockPostgresClient);
      mockClient.query.mockReturnValue(Promise.resolve({rows: ['data']}));
      return actualFunc({params: {}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockQueryRecords.mock.calls).toMatchSnapshot();
      });
    });
  });
});
