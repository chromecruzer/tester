const yargs = require('yargs');
const util = require('util')
const _ = require("lodash");
const {rest} = require("lodash");
const DockerExec = require("./lib/docker-exec");
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    name: {
      type: 'string',
      describe: 'name of the volume'
    },
  })
  .help('?')
  .alias('?', 'help')
  .argv;
const dockerExec = new DockerExec();
const restoreVolume = async (name, volumes) => {
  if (_.includes(volumes, name)) {
    console.log(`${name} already exists`);
    return;
  }
  const stdout = await dockerExec.volumeCreate(name);
  await dockerExec.volumeRestore(name);
  console.log(`volume ${name} restore ${stdout}`);
};
const execute = async () => {
  if(!dockerExec.checkVolumneName(argv.name)) {
    console.error(`${argv.name} is not a trac volume`);
    return;
  }
  const volumes = await dockerExec.getVolumes();
  console.log(` argv ${dump(argv)}`)
  await restoreVolume(argv.name, volumes);
}
execute();
