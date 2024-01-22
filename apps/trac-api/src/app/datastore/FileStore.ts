
import path from "path";
import {AuditRecord, Comparisons, EmailSettings} from "@trac/datatypes";

import util from "util";
import DataStoreUtilities from "./DataStoreUtilities";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class FileStore {
  private json: ((Comparisons | AuditRecord | EmailSettings) | null) = null;
  private filename;
  private dsu: DataStoreUtilities;
  constructor(storagePath, filename) {
    this.filename = path.join(storagePath, `${filename}.json`);
    this.dsu = new DataStoreUtilities();
  }
  public async get() {
    // console.log(`cached content is ${dump(this.json)}`);
    if(this.json) {
      return this.json;
    }
    return this.read();
  }
  private async read() {
    if(!await this.dsu.check(this.filename)) {
      return null;
    }
    return this.dsu.retrieve(this.filename).then(read => {
      // console.log(`retrieved content ${dump(read)}`)
      this.json = read;
      return read;
    });
  }
  public async set(json) {
    this.json = json;
    // console.log(`Writing to ${this.filename} content ${dump(json)}`);
    return this.dsu.store(this.filename, json);
  }
  public async remove() {
    this.json = null;
    return this.dsu.remove(this.filename)
  }
}
