import GetAuditData from "../GetAuditData";

describe('GetAuditData', () => {
  let mockPostgresClient, mockClient, postgresConfig, getter, mockJson;
  beforeEach(() => {
    mockJson = jest.fn();
    mockClient = {
      query: jest.fn().mockImplementation(() => Promise.resolve({rows: 'row data from db'})),
    };
    mockPostgresClient = {
      getClient: jest.fn().mockImplementation(() => Promise.resolve(mockClient)),
      release: jest.fn(),
    };
    postgresConfig = {
      getAuditSchemaName: jest.fn().mockImplementation(() => 'AUDIT SCHEMA'),
      getSchemaName: jest.fn().mockImplementation(() => 'DATA SCHEMA'),
    };
    getter = new GetAuditData(postgresConfig, 'CUSTOMER TABLE');
  });
  describe('getAuditLocations', () => {
    it('should query a request for all correctly', () => {
      const getLocations =  getter.getAuditLocations(mockPostgresClient);
      return getLocations({query: {
        }}, {json: mockJson}, jest.fn())
        .then(() => {
          expect(mockClient.query.mock.calls).toMatchSnapshot();
        })
    });
    it('should query a request with a uuid correctly', () => {
      const getLocations =  getter.getAuditLocations(mockPostgresClient);
      return getLocations({query: {
          customerId: 'the customer'
        }}, {json: mockJson}, jest.fn())
        .then(() => {
          expect(mockClient.query.mock.calls).toMatchSnapshot();
        })
    });
    it('should query a request with a location code correctly', () => {
      const getLocations =  getter.getAuditLocations(mockPostgresClient);
      return getLocations({query: {
          uuid: 'audit uuid'
        }}, {json: mockJson}, jest.fn())
        .then(() => {
          expect(mockClient.query.mock.calls).toMatchSnapshot();
        })
    });
    it('should query a request an audit status correctly', () => {
      const getLocations =  getter.getAuditLocations(mockPostgresClient);
      return getLocations({query: {
          status: 'AUDIT STATUS'
        }}, {json: mockJson}, jest.fn())
        .then(() => {
          expect(mockClient.query.mock.calls).toMatchSnapshot();
        })
    });
  });
  describe('getAudit', () => {
    xit('should query for the location, audit items, and associated notes correctly', () => {
    });
  });
});
