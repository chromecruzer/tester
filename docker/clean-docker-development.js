const yargs = require('yargs');
const _ = require("lodash");
const DockerComposeExec = require("./lib/docker-compose-exec");
const {dbUser} = require("./lib/settings");
const DockerExec = require("./lib/docker-exec");
const dockerExec = new DockerExec();
const argv = yargs(process.argv.slice(2))
  .options({
    removeVolumes: {
      type: 'boolean',
      describe: 'remove all of the volumes'
    },
  })
  .help('?')
  .alias('?', 'help')
  .argv;

const dockerComposeExec = new DockerComposeExec(dbUser, null, false);
const execute = async () => {
  await dockerComposeExec.down(['db', 'api', 'web']);
  if(!argv.removeVolumes) {
    return;
  }
  _.forEach(dockerExec.getVolumeNames(false),
      n => dockerExec.volumeRemove(n));
}
execute();
