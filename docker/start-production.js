const yargs = require('yargs');
const util = require('util')
const DockerComposeExec = require("./lib/docker-compose-exec");
const {dbUser} = require("./lib/settings");
const path = require("path");
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    useVersion: {
      type: 'string',
      describe: 'version to start'
    },
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
  })
  .demandOption(['useVersion'], 'Need to specify a version to start')
  .help('?')
  .alias('?', 'help')
  .argv;
const dockerComposeExec = new DockerComposeExec(dbUser, null, true, null, argv.configdir, argv.certdir);
const execute = async () => {
  await dockerComposeExec.up(['db', 'api', 'web'], argv.reset);
}

execute();
