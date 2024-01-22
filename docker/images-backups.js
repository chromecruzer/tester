const yargs = require('yargs');
const util = require('util');
const _ = require('lodash')
const TracProcess = require("./lib/trac-process");
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    restore: {
      type: 'string',
      describe: 'import images from tar file'
    },
    backup: {
      type: 'string',
      describe: 'export images to tar file'
    },
  })
  .help('?')
  .alias('?', 'help')
  .argv;
const file = argv._[0];
const tracProcess = new TracProcess();
if(!_.isString(argv.restore) && !_.isString(argv.backup)) {
  throw new Error(`need either --restore TARFILE or --backup TARFILE`);
}
const execute = async () => {
  const command = argv.restore ? ['load', '-i', argv.restore] : ['save', '-o', argv.backup, 'trac/web', 'trac/api']
  await tracProcess.exe(`docker`, command)
}
execute();
