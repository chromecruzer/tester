import PostgresConfigFactory from "../PostgresConfigFactory";
import * as util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth: depth, colors: true});


describe('PostgresConfigFactory', () => {
  let mockFs, mockConfig;
  beforeEach(() => {
    mockConfig = {
      user: 'db user',
      password: 'user password',
      port: 4000,
      rootdatabase: 'db root',
      database: 'user db',
      host: 'hostname',
      schema: 'db schema'
    };
    mockFs = {
      readJSON: jest.fn()
    }
  });
  describe('#load', () => {
    it('should parse the configuration file correctly.', () => {
      mockFs.readJSON.mockReturnValue(mockConfig);
      const filename = 'my config file';
      return PostgresConfigFactory.load(filename, mockFs).then(actual => {
        expect(mockFs.readJSON.mock.calls.length).toBe(1);
        expect(mockFs.readJSON.mock.calls[0][0]).toBe(filename);
        expect(actual.config).toStrictEqual(mockConfig);
      });
    });
  });
  describe('Object Methods', () => {
    let factory;
    beforeEach(() => {
      factory = new PostgresConfigFactory(mockConfig);
    });

    describe('#getTracConfig', () => {
      it('should return the proper configuration', () => {
        const actual = factory.getTracConfig();
        expect(actual.user).toBe(mockConfig.user);
        expect(actual.password).toBe(mockConfig.password);
        expect(actual.port).toBe(mockConfig.port);
        expect(actual.host).toBe(mockConfig.host);
        expect(actual.database).toBe(mockConfig.database);
      });
    });
    describe('#getRootConfig', () => {
      it('should return the proper configuration', () => {
        const actual = factory.getRootConfig();
        expect(actual.user).toBe(mockConfig.user);
        expect(actual.password).toBe(mockConfig.password);
        expect(actual.port).toBe(mockConfig.port);
        expect(actual.host).toBe(mockConfig.host);
        expect(actual.database).toBe(mockConfig.rootdatabase);
      });
    });
  });
});
