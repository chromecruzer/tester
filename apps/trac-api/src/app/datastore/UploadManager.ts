import util from "util";
import _ from "lodash";
import path from "path";
import {DateTime} from "luxon";
import {UploadConfiguration} from "../ApiConfiguration";
import {
  dateNow,
  supportedUploadFiles,
  UploadMetadata,
  UploadSupportedFileTypes
} from "@trac/datatypes";

const userSessionsFile = 'activeSessions.json';
const uploadMetadataFile = 'uploadFileProperties.json';
import DataStoreUtilities from "./DataStoreUtilities";


const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});


export interface UserSession {
  token: string;
  uploadName: string;
  type: UploadSupportedFileTypes;
  user: string;
  created: Date;
  form: { [id: string]: string };
}

export default class UploadManager {
  public sessions: { [id: string]: UserSession } = {};
  public metadata: UploadMetadata[] = [];
  public uploadPath: string;
  private readonly filePath: (filename) => string;
  private dsu: DataStoreUtilities;

  constructor(private config: UploadConfiguration) {
    this.uploadPath = path.join(...this.config.root);
    this.filePath = filename => path.join(this.uploadPath, filename);
    this.dsu = new DataStoreUtilities();
  }

  public async initialize() {
    const err = [];
    await this.checkUploadDirectories()
      .catch(e => err.push(...e));
    await this.checkFolder('audit_scans');
    await this.loadJson(userSessionsFile)
      .catch(e => console.info('no sessions found'));
    Object.keys(this.sessions).map(async s => {
      const session = this.sessions[s];
      delete this.sessions[s]
      return this.dsu.remove(session.uploadName)
        .catch(e => err.push(new Error(`Cannot remove ${session.uploadName} because ${e.message}`)));
    });
    await this.saveJson(userSessionsFile)
      .catch(e => err.push(e));
    await this.loadJson(uploadMetadataFile)
      .catch(e => console.log('upload archive is empty'));
    if (err.length > 0) {
      return Promise.reject(err);
    }
    console.log('initialize is done');
    // console.log(`archives ${dump(this.metadata)}`)
  }

  private async checkFolder(folder, err = []) {
    const dir = path.join(this.uploadPath, folder);
    console.log(`checking upload folder ${dir}`);
    return this.dsu.mkdir(dir)
      .catch(() =>
        err.push(new Error(`Cannot create upload folder "${folder}" in ${this.uploadPath}`)));
  }

  private async checkUploadDirectories() {
    const err = [];
    supportedUploadFiles().forEach(f => this.checkFolder(f,err));
    if (err.length > 0) {
      return Promise.reject(err);
    }
  }

  public async removeSession(token: string, removeFile = false) {
    const err = [];
    const session = this.sessions[token];
    if (session) {
      delete this.sessions[token];
      if (removeFile) {
        await this.dsu.remove(session.uploadName)
          .catch(e => err.push(new Error(`Cannot remove ${session.uploadName} because ${e.message}`)));
      }
      await this.saveJson(userSessionsFile)
        .catch(e => err.push(e));
      if (err.length > 0) {
        return Promise.reject(err);
      }
    }
  }

  public async addSession(filepath, user, type, form) {
    let err = null;
    const result = {
      token: UploadManager.newToken(),
      type,
      uploadName: filepath,
      user,
      created: DateTime.now().toJSDate(),
      form,
    };
    this.sessions[result.token] = result;
    // console.log(`sessions ${dump(this.sessions)}`)
    await this.saveJson(userSessionsFile)
      .catch(e => err = e);
    if (err) {
      return Promise.reject(err);
    }
    return result.token;
  }

  public async archiveSession(token: string) {
    const err = [];
    const session = this.sessions[token] || null;
    if (session === null) {
      return Promise.reject([new Error(`Session with token ${token} does not exist`)]);
    }
    // console.log(`archiving session ${dump(session)}`);
    const archived = {
      name: session.uploadName,
      type: session.type,
      user: session.user,
      date: session.created,
      form: session.form
    };
    this.metadata.push(archived);
    await this.removeSession(token)
      .catch(e => err.push(...e));
    await this.saveJson(uploadMetadataFile)
      .catch(e => err.push(e));
    if (err.length > 0) {
      return Promise.reject(err);
    }
  }

  public async markRefresh(user) {
    const err = [];
    const archived = {
      type: 'refresh_data' as UploadSupportedFileTypes,
      user,
      date: dateNow(),
    };
    this.metadata.push(archived);
    await this.saveJson(uploadMetadataFile)
      .catch(e => err.push(e));
    if (err.length > 0) {
      return Promise.reject(err);
    }
  }

  public history() {
    // console.log('setting up history');
    return (req, res) => {
      // console.log('returning history')
      res.json(_.filter(this.metadata, m => m.type !== 'audit_scans'));
    }
  }

  private async loadJson(filename: string) {
    const filepath = this.filePath(filename);
    // console.log(`checking path ${filepath}`);
    if (!await this.dsu.check(filepath)) {
      return;
    }
    // console.log(`reading from path ${filepath}`);
    return this.dsu.retrieve(filepath)
      .then(json => {
        // console.log(`retrieved ${dump(json)}`);
        if (filename === userSessionsFile) {
          this.sessions = json;
        } else {
          this.metadata = json;
        }
      })
      .catch(e => new Error(`File ${filepath} could not be read. ${e.message}`));
  }

  private async saveJson(filename) {
    const filepath = this.filePath(filename);
    const json = filename === userSessionsFile ? this.sessions : this.metadata;
    // console.log(`writing ${dump(json)} to ${filepath}`);
    return this.dsu.store(filepath, json)
  }

  static newToken() {
    return Math.random().toString(36).substring(0, 10)
      .replace('.', '');
  }
}
