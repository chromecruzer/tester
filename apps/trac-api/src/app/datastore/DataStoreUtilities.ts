import fs from 'fs-extra';
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class DataStoreUtilities {
  fs = fs;
  public async retrieve(filepath) {
    console.log(`reading file from client`)  // added by me 
    return this.fs.readJson(filepath)
      .catch(e => Promise.reject(new Error(`File ${filepath} could not be read. ${e.message}`)));
  }
  
  public async store(filepath, json) {
    // console.log(`writing content ${dump(json)} to filepath ${filepath}`)
    return this.fs.writeJson(filepath, json)
      .catch(e => Promise.reject(new Error(`Cannot save file ${filepath} because ${e.message}`)));
  }
  public async check(filepath) {
    const result = await this.fs.pathExists(filepath);
    // console.log(`file ${filepath} exists ${result}`);
    return result;
  }
  public async remove(filepath) {
    return this.fs.remove(filepath)
      .catch(e => Promise.reject(new Error(`Cannot remove ${filepath} because ${e.message}`)));
  }
  public async mkdir(dir) {
    return this.fs.ensureDir(dir)
      .catch(err => Promise.reject(new Error(`Cannot create upload folder "${dir}" in ${dir} because ${err.message}`)));
  }
}
