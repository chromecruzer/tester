import {PostgresConfigFactory, queryRecords} from '@trac/postgresql';
import GetSalesReps from "../GetSalesReps";

jest.mock('@trac/postgresql');
describe('GetSalesReps', () => {
  let mockQueryRecords, mockClient, mockPostgresClient, getSalesReps;
  beforeEach(() => {
    mockQueryRecords = jest.mocked(queryRecords)
      .mockReturnValue(Promise.resolve(['data']));
    mockClient = {
      query: jest.fn().mockReturnValue(Promise.resolve({rows: ['data']})),
    }
    mockPostgresClient = {
      getClient: jest.fn().mockReturnValue(Promise.resolve(mockClient)),
      release: jest.fn()
    };
    const postgresConfigFactory = {
      getSchemaName: () => 'schemanameFromConfig'
    }  as PostgresConfigFactory;
    getSalesReps = new GetSalesReps(postgresConfigFactory, 'sales jump table',
      'sales rep table')
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('getSalesReps', () => {
    it('should call query records correctly', () => {
      const actualFunc = getSalesReps.getSalesReps(mockPostgresClient);
      return actualFunc({params: {uuid: 'uuidForSalesRep'}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockQueryRecords.mock.calls).toMatchSnapshot();
      });
    });
  });
  describe('getSalesRepsForRole', () => {
    it('should query mappings and call query records correctly', () => {
      mockClient.query.mockReturnValue(Promise.resolve({ rows: [{salesrep_id: 'salesId1'},
          {salesrep_id: 'salesId2'}]}))
      const actualFunc = getSalesReps.getSalesRepsForRole(mockPostgresClient);
      return actualFunc({params: {role: 'sales rep role'}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockClient.query.mock.calls).toMatchSnapshot();
        expect(mockQueryRecords.mock.calls).toMatchSnapshot();
      });
    });
  });
  describe('getSalesRepsForCustomer', () => {
    it('should query mappings and call query records correctly', () => {
      mockClient.query.mockReturnValue(Promise.resolve({ rows: [{salesrep_id: 'salesId1'},
          {salesrep_id: 'salesId2'}]}))
      const actualFunc = getSalesReps.getSalesRepsForCustomer(mockPostgresClient);
      return actualFunc({params: {customerId: 'customer id'}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockClient.query.mock.calls).toMatchSnapshot();
        expect(mockQueryRecords.mock.calls).toMatchSnapshot();
      });
    });
  });
  describe('getCustomersForSalesRep', () => {
    it('should query mappings and call query records correctly', () => {
      mockClient.query.mockReturnValue(Promise.resolve({ rows: [{customer_id: 'customer1'},
          {customer_id: 'customer2'}]}))
      const actualFunc = getSalesReps.getCustomersForSalesRep(mockPostgresClient);
      return actualFunc({params: {salesrepId: 'sales rep id'}}, {json: jest.fn()}, jest.fn()).then(() => {
        expect(mockClient.query.mock.calls).toMatchSnapshot();
        expect(mockQueryRecords.mock.calls).toMatchSnapshot();
      });
    });
  });
});
