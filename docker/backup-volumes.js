const yargs = require('yargs');
const util = require('util');
const _ = require("lodash");
const DockerExec = require("./lib/docker-exec");
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    production: {
      type: 'boolean',
      describe: 'volumes for production'
    },
  })
  .help('?')
  .alias('?', 'help')
  .argv;
const dockerExec = new DockerExec();

const backup = async (name, volumes) => {
  // console.log(`volumes ${dump(volumes)}`)
  // console.log(`checking volume ${name} ${_.includes(volumes, name) ? 'exists' : 'does not exist'}`)
  if (!_.includes(volumes, name)) {
    console.log(`${name} does not exist!`);
    return;
  }
  return dockerExec.volumeBackup(name);
}
const execute = async () => {
  const volumes = await dockerExec.getVolumes();
  // console.log(`volumes ${dump(volumes)}`)
  _.forEach(dockerExec.getVolumeNames(argv.production), n => backup(n, volumes));
}
execute();
