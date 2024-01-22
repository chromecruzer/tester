const yargs = require('yargs');
const util = require('util');
const _ = require('lodash')
const path = require("path");
const DockerExec = require("./lib/docker-exec");
const NxExec = require("./lib/nx-exec");
const DockerComposeExec = require("./lib/docker-compose-exec");
const {outsidePorts, deployment, dbUser, configDirName, insidePorts} = require("./lib/settings");

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    pw: {
      type: 'string',
      describe: 'password for the postgresql database'
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
      alias: 'r'
    },
    production: {
      type: 'boolean',
      describe: 'volumes for production if true'
    },
  })
  .default({
    configdir: path.join(process.cwd(), 'tmp', 'config'),
    certdir: path.join(process.cwd(), 'tmp', 'certs'),
  })
  .demandOption(['pw'], 'Need to specify the database password')
  .help('?')
  .alias({
    '?': 'help',
  })
  .argv;
console.log(`arguments ${dump(argv)}`);

const dockerExec = new DockerExec();
const nxExec = new NxExec(argv.pw, argv.configdir);
const dockerComposeExec = new DockerComposeExec(dbUser, argv.pw, argv.production, null, argv.configdir,
  argv.certdir, 'postgres');

const fillPgdata = async (production) => {
  console.log(`fill pgdata is starting db container`);
  await dockerComposeExec.up(['db']);
  // console.log(`fill pgdata is running db-reset '${outsidePorts('db', argv.production)}'`)
  await nxExec.dbreset('localhost', outsidePorts('db', production), argv.reset);
  await dockerComposeExec.down(['db']);
  await dockerComposeExec.clean();
}

const execute = async () => {
  const name = `${deployment(argv.production)}-pgdata`;
  if(argv.reset) {
    await dockerExec.volumeRemove(name);
  }
  await dockerExec.volumeCreate(name);
  fillPgdata(argv.production);
}
execute();
