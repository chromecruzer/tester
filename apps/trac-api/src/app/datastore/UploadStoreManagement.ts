import path from "path";
import FileStore from "./FileStore";
import DataStoreUtilities from "./DataStoreUtilities";
const storagePathFn = uploadConfig => path.join(...uploadConfig.root, 'session-data');
export default class UploadStoreManagement {
  private results: { [id: string]: FileStore } = {};
  private storagePath: string;
  constructor(uploadConfig) {
    this.storagePath = storagePathFn(uploadConfig);
  }
  static async createStorageDir(uploadConfig, testDsu = null) {
    const dsu = testDsu || new DataStoreUtilities();
    return dsu.mkdir(storagePathFn(uploadConfig));
  }
  public async create(session, json) {
    const store = new FileStore(this.storagePath, session);
    // console.log(`create storage path ${this.storagePath} with ${session}`)
    return store.set(json).then(() => {
      this.results[session] = store;
    });
  }
  private async recreate(session) {
    const store = new FileStore(this.storagePath, session);
    // console.log(`recreate storage path ${this.storagePath} with ${session}`)
    const json = await store ? store.get() : null;
    this.results[session] = store;
    return json;
  }

  public async retrieve(session) {
    // console.log(`retrieving ${session}`)
    if(this.results[session]) {
      return this.results[session].get();
    }
    return this.recreate(session);
  }
  public async removeDataStore(session) {
    return this.results[session].remove().then(() => {
      delete this.results[session];
    });
  }

}
