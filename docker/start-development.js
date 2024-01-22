const yargs = require('yargs');
const util = require('util')
const {exec} = require("child_process");
const path = require("path");
const NxExec = require("./lib/nx-exec");
const DockerComposeExec = require("./lib/docker-compose-exec");
const {dbUser} = require("./lib/settings");
const os = require("os");
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    pw: {
      type: 'string',
      describe: 'password for the database'
    },
    // apihost: {
    //   type: 'string',
    //   describe: 'hostname for the trac-api server'
    // },
    configdir: {
      type: 'string',
      describe: 'local configuration directory for the containers'
    },
    certdir: {
      type: 'string',
      describe: 'local cert directory for the containers'
    },
    reset: {
      type: 'boolean',
      describe: 'remove existing volumes and network if true',
      alias:'r'
    },
  })
  .default({
    configdir: path.join(process.cwd(), 'tmp', 'config'),
    certdir: path.join(process.cwd(), 'tmp', 'certs'),
    // apihost: os.hostname()
  })
  .demandOption(['pw'], 'Need to specify the database password')
  .help('?')
  .alias('?', 'help')
  .alias('c', 'configdir')
  .argv;
console.log(`password ${argv.pw} config directory ${argv.configdir}`);
const nxExec = new NxExec(argv.pw, argv.configdir);
const dockerComposeExec = new DockerComposeExec(dbUser, argv.pw, false, null, argv.configdir, argv.certdir);
const execute = async () => {
  await nxExec.build(false);
  await dockerComposeExec.up(['db', 'api', 'web'], argv.reset);
}

execute();
