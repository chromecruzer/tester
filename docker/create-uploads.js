const yargs = require('yargs');
const util = require('util');
const _ = require('lodash')
const DockerExec = require("./lib/docker-exec");
const {deployment} = require("./lib/settings");
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
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
  .help('?')
  .alias({
    '?': 'help',
  })
  .argv;
console.log(`arguments ${dump(argv)}`);

const dockerExec = new DockerExec();


const execute = async () => {
  const name = `${deployment(argv.production)}-config`;
  if(argv.reset) {
    await dockerExec.volumeRemove(name);
  }
  await dockerExec.volumeCreate(name);
}
execute();
