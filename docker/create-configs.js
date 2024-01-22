const yargs = require('yargs');
const util = require('util');
const _ = require('lodash')
const fs = require("fs-extra");
const path = require("path");
const NxExec = require("./lib/nx-exec");
const DockerComposeExec = require("./lib/docker-compose-exec");
const {outsidePorts, deployment, dbUser, configDirName, insidePorts} = require("./lib/settings");
const GenerateNginx = require("./lib/generate-nginx");

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    pw: {
      type: 'string',
      describe: 'password for the postgresql database'
    },
    tpw: {
      type: 'string',
      describe: 'password for the mssql database'
    },
    apihost: {
      type: 'string',
      describe: 'hostname for the trac-api server'
    },
    smtphost: {
      type: 'string',
      describe: 'hostname for the SMTP server for emails'
    },
    smtpport: {
      type: 'number',
      describe: 'port for the SMTP server for emails'
    },
    configdir: {
      type: 'string',
      describe: 'local configuration directory for the containers'
    },
    certdir: {
      type: 'string',
      describe: 'local cert directory for the containers'
    },
    certfile: {
      type: 'string',
      describe: 'Certificate filename'
    },
    certkeyfile: {
      type: 'string',
      describe: 'Certificate Key filename'
    },
    production: {
      type: 'boolean',
      describe: 'volumes for production if true'
    },
  })
  .default({
    configdir: path.join(process.cwd(), 'tmp', 'config'),
    certdir: path.join(process.cwd(), 'tmp', 'certs'),
    certfile: 'cert.pem',
    certkeyfile: 'key.pem',
    apihost: 'localhost',
    smtphost: 'localhost',
    smtpport: 1025,
  })
  .help('?')
  .alias({
    '?': 'help',
  })
  .argv;
console.log(`arguments ${dump(argv)}`);
const nxExec = new NxExec(argv.pw, argv.configdir);
const generateNginx = new GenerateNginx('api', insidePorts('web'), insidePorts('api'),
  argv.certfile, argv.certkeyfile);
const dockerComposeExec = new DockerComposeExec(dbUser, argv.pw, argv.production, null, argv.configdir,
  argv.certdir, 'postgres');

const fillConfig = async (production) => {
  const configDir = configDirName(argv.configdir, production);
  console.log(`fill config ${configDir}`);
  await fs.ensureDir(configDir);
  console.log(`fill config write files ${configDir}`);
  await nxExec.writeDbConfig(`${configDir}/dbConfig.json`, `${deployment(production)}-db`,
    insidePorts('db'));
  await nxExec.writeMailConfig(`${configDir}/mailConfig.json`, argv.smtpport, argv.smtphost);
  await nxExec.writeTediousConfig(`${configDir}/tediousConfig.json`, argv.tpw);
  await nxExec.writeWebConfig(`${configDir}/webConfig.js`, outsidePorts('web', production),
    argv['apihost'], await dockerComposeExec.extractVersion());
  await dockerComposeExec.writeUploadConfig(`${configDir}/uploadConfig.json`);
  await generateNginx.generate(configDir, production);
}

fillConfig(argv.production);
