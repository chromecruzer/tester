import path from "path";
import FileStore from "./FileStore";
import {initialEmailSettings} from "@trac/datatypes";
import util from "util";
import DataStoreUtilities from "./DataStoreUtilities";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const storagePathFn = uploadConfig => path.join(...uploadConfig.root, 'settings');
const emailSettingsFilename = 'emailSettings';
export default class Settings {
  private emailFileStore: FileStore;

  constructor(uploadConfig) {
    this.emailFileStore = new FileStore(storagePathFn(uploadConfig), emailSettingsFilename);
  }

  public static async initialize(uploadConfig, testDsu = null) {
    const dsu = testDsu || new DataStoreUtilities();
    const filePath = path.join(storagePathFn(uploadConfig), `${emailSettingsFilename}.json`);
    // console.log(`checking file path ${filePath}`);
    if (!await dsu.check(filePath)) {
      dsu.mkdir(storagePathFn(uploadConfig))
      await dsu.store(filePath, initialEmailSettings);
    }
    const result = new Settings(uploadConfig);
    // console.log(`Dumping Settings ${dump(await result.getEmailSetting())}`)
    return result;
  }

  public async getEmailSetting() {
    return this.emailFileStore.get()
  }

  public async setEmailSetting(value) {
    await this.emailFileStore.set({...value});
  }
}
