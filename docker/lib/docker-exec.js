const util = require('util');
const _ = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const TracProcess = require("./trac-process");
const {networkName, deployment} = require("./settings");

const exec = util.promisify(require('node:child_process').exec);
const volumeLsRegex = /local\s+(\S+)$/mg;  // assume only local drivers are used for volumes
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});


const DockerExec  = class {
  constructor() {
    this.childProcess = new TracProcess();
  }

  getVolumeNames(production) {
    const volumes = ['pgdata', 'uploads'];
    return _.map(volumes, v => `${deployment(production)}-${v}`);
  }
  checkVolumneName(name) {
    let volumes = this.getVolumeNames(false);
    if(_.includes(volumes, name)) {
      return true;
    }
    volumes = this.getVolumeNames(true);
    return !!_.includes(volumes, name);

  }
  async volumeCreate(name) {
    return this.childProcess.exe('docker', ['volume', 'create', name]);
  }
  async volumeBackup(name) {
    const localPath = path.join(__dirname, 'trac-backups');
    const container = `trac-backup-${name}`;
    await fs.ensureDir(localPath);
    await this.run(['-v', `${name}:/target`, '-v', `${localPath}:/backup`, '--name', container,
      'ubuntu', 'bash', '-c', `'cd /target && tar czvf /backup/${name}.tgz .'`]);
    return this.remove(container);
  }
  async networkCreate(production) {
    return this.childProcess.exe('docker', ['network', 'create', '--driver', 'bridge',
      networkName(production)]);
  }
  async networkRemove(production) {
    return this.childProcess.exe('docker', ['network', 'rm', networkName(production)]);
  }
  async volumeRestore(name) {
    const localPath = path.join(__dirname, 'trac-backups');
    const container = 'trac-restore-script';
    await this.run(['-v', `${name}:/target`, '-v', `${localPath}:/backup`, '--name', container,
      'ubuntu', `bash -c 'cd /target && tar xzvf /backup/${name}.tgz .'`]);
    return this.remove(container);
  }
  async volumeRemove(name) {
    return this.childProcess.exe('docker', ['volume', 'rm', name]);
  }
  async getVolumes() {
    const stdout = await this.childProcess.exe('docker', ['volume', 'ls']);
    console.log(`volume ls returned ${stdout}`);
    let token;
    const result = [];
    while((token = volumeLsRegex.exec(stdout)) !== null) {
      result.push(token[1]);
    }
    return result;
  }
  async networkExists(production) {
    const stdout = await this.childProcess.exe('docker', ['volume', 'ls']);
    console.log(`network ls returned ${stdout} exists is ${_.includes(stdout, networkName(production))}`);
    return _.includes(stdout, networkName(production));
  }
  async run(args) {
    const stdout = await this.childProcess.exe('docker', ['run',...args]);
  }
  async build(args) {
    const stdout = await this.childProcess.exe('docker', ['build',...args]);
  }
  async remove(container) {
    const stdout = await this.childProcess.exe('docker', ['rm', container]);
  }
}
module.exports = DockerExec;
