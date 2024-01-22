const { spawn } = require('node:child_process');
const util = require("util");
const _ = require("lodash");

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});


const TracProcess  = class {
  constructor() {
    this.env = null;
    this.out = [];
  }
  setEnv(name, value) {
    this.env = this.env || {...process.env};
    this.env[name] = value;
  }
  exe(cmd, args) {
    return new Promise((resolve, reject) => {
      // console.log(`spawn with '${cmd}' and  ${_.join(args, ' ')} `);
      this.out = [];
      this.childProcess = spawn(cmd, args, {shell: true, env: this.env});
      this.childProcess.on('error', err => {
        const msg = `process ${cmd}  ${_.join(args, ' ')}  failed because ${err}`;
        console.error(msg);
        reject(msg);
      });
      this.childProcess.on('close',code => {
        const msg = `process ${cmd} ${_.join(args, ' ')} ${ code === 0 ? 'completed' : 'failed'} with ${code}`;
        console.log(msg);
        if(code !== 0) {
          reject(msg);
        } else {
          resolve(this.out);
        }
      });
      this.childProcess.stdout.on('data', data => {
        console.log(data.toString());
        this.out.push(data.toString());
      });
      this.childProcess.stderr.on('data', data => {
        console.error(data.toString());
        this.out.push(data.toString());
      });
    })
  }
}
module.exports = TracProcess;
