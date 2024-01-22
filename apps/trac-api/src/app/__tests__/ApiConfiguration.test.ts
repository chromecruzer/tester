import ApiConfiguration from "../ApiConfiguration";
import UploadManager from "../datastore/UploadManager";
import {PostgresConfigFactory} from "@trac/postgresql";

jest.mock('../datastore/UploadManager');
jest.mock('fs-extra', () =>({
  readJson: jest.fn().mockReturnValue(Promise.resolve({root: ["C:", "Users", "bletzim",
      "repos", "trac", "uploads"]}))
}));
jest.mock('../datastore/UploadStoreManagement', () =>({
  createStorageDir: jest.fn().mockReturnValue(Promise.resolve()),
}));
describe('ApiConfiguration', () => {
  describe('.initialize', () => {
    let dbConfig, upConfig, mockUploadInitialize, mockPostgresConfigLoad, apiConfig, mockDsu,
      uploadFile, dbConfigFile;
    beforeEach(async () => {
      dbConfig = {
        user: 'db user',
        password: 'user password',
        port: 4000,
        rootdatabase: 'db root',
        database: 'user db',
        host: 'hostname',
        schema: 'db schema'
      };
      upConfig = {
        root: ["C:", "Users", "bletzim", "repos", "trac", "uploads"]
      };
      dbConfigFile = '/path/to/db/config';
      uploadFile = '/path/to/upload/config';
      mockUploadInitialize = jest.spyOn(UploadManager.prototype, 'initialize');
      mockPostgresConfigLoad = jest.spyOn(PostgresConfigFactory, 'load')
        .mockImplementation(() => {
          return dbConfig;
        });
      apiConfig = await ApiConfiguration.initialize({
        dbConfigFile,
        uploadFile
      });

    });
    it('should create a configuration for postgres', () => {
      expect(mockPostgresConfigLoad).toBeCalledWith(dbConfigFile);
    });
    it('should create a configuration for upload', () => {
      expect(apiConfig.uploadConfig).toEqual(upConfig);
    });
    it('should create and initialize an upload manager', () => {
      expect(mockUploadInitialize).toBeCalled();
    });
  });
});
