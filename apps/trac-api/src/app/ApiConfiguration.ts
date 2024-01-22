import {PostgresConfigFactory} from "@trac/postgresql";
import fs from 'fs-extra';
import {TediousConfigFactory} from "@trac/tedious";
import UploadManager from "./datastore/UploadManager";
import UploadStoreManagement from "./datastore/UploadStoreManagement";
import DataStoreUtilities from "./datastore/DataStoreUtilities";

export interface ConfigurationPaths {
  uploadFile: string;
  dbConfigFile: string;
}
export interface MailConfiguration {
  host: string;
  port: number;
  expired_sender: string;
  missing_sender: string;
}

export interface UploadConfiguration {
  root: string[];
}
export interface ApiConfigPathType {
  dbConfigFile: string;
  uploadFile: string;
  templatesPath: string;
  tediousConfigFile: string;
  mailFile: string
}

export default class ApiConfiguration {
  public uploadManager: UploadManager;
  fs = fs;

  constructor(
    public postgresConfig: PostgresConfigFactory,
    public uploadConfig: UploadConfiguration,
    public mailConfig: MailConfiguration,
    public tediousConfig: TediousConfigFactory,
    public templatesPath: string) {
    this.uploadManager = new UploadManager(this.uploadConfig);
  }

  public static async initialize(configPaths: ApiConfigPathType) {
    const postgresConfig = await PostgresConfigFactory.load(configPaths.dbConfigFile);
    const uploadConfig = await ApiConfiguration.loadUploadConfig(configPaths.uploadFile);
    const mailConfig = await ApiConfiguration.loadUploadConfig(configPaths.mailFile);
    const tediousConfig = await TediousConfigFactory.load(configPaths.tediousConfigFile);
    const dsu = new DataStoreUtilities();
    dsu.mkdir(configPaths.templatesPath); // make sure the templates directory exists
    const result = new ApiConfiguration(postgresConfig, uploadConfig, mailConfig, tediousConfig,
      configPaths.templatesPath);
    await result.uploadManager.initialize();
    await UploadStoreManagement.createStorageDir(uploadConfig);
    return result;
  }

  private static loadUploadConfig(uploadFile: string) {
    return fs.readJson(uploadFile).catch(err => {
      throw Error(`File ${uploadFile} could not be read. ${err.message}`)
    });
  }
  private static loadMailConfig(mailConfigFile: string) {
    return fs.readJson(mailConfigFile).catch(err => {
      throw Error(`File ${mailConfigFile} could not be read. ${err.message}`)
    });
  }
}
