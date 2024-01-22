import PostgresConfigFactory from "../PostgresConfigFactory";
import PostgresClient from "../PostgresClient";

describe('PostgresClient', () => {
  let mockPool, mockClient, mockConfig, tracClient;
  beforeEach(()=> {
    mockPool = {
      connect: jest.fn(),
      end: jest.fn(),
    };
    mockClient = {
      release: jest.fn()
    }
    mockPool.connect.mockImplementation(() => {
      return Promise.resolve(mockClient);
    })
    mockPool.end.mockImplementation(() => {
      return Promise.resolve('end worked');
    })
    mockConfig = new PostgresConfigFactory({
      user: 'db user',
      password: 'user password',
      port: 4000,
      rootdatabase: 'db root',
      database: 'user db',
      host: 'hostname',
      audit_schema: 'audit schema',
      schema: 'db schema'
    });
    tracClient = new PostgresClient(mockConfig);
    tracClient.pool = mockPool;
  });
  describe('#getClient', () => {
    it('should return a promise with success', () => {
      return tracClient.getClient().then(result => {
        // console.log('checking results');
        expect(result).toEqual(mockClient);
      })
    });
  });
  describe('#release', () => {
    it('should return a promise with success', () => {
      return tracClient.release(mockClient)
    });

  });
  describe('throwError', () => {
    it('should throw error with specified contents', () => {
      return expect(tracClient.throwError('stage','I quit because that error bugs me',
        mockClient)).rejects.toMatchSnapshot();
    });
  });
});
