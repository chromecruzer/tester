const os = require("os");
const DockerExec = require("./lib/docker-exec");
const yargs = require("yargs");
const path = require("path");
const fs = require("fs-extra");
const argv = yargs(process.argv.slice(2))
  .options({
    certdir: {
      type: 'string',
      describe: 'local cert directory for the containers'
    },
  })
  .default('certdir', path.join(process.cwd(), 'tmp', 'certs'))
  .help('?')
  .alias('?', 'help')
  .alias('c', 'configdir')
  .argv;


const host = os.hostname();
console.log(`hostname ${host}`);
fs.ensureDir(argv.certdir);
const dockerExec = new DockerExec();
dockerExec.run(['-v', `${argv.certdir}:/certs`, '-e', `SSL_SUBJECT=${host}`, 'paulczar/omgwtfssl']);
// docker run -v /tmp/certs:/certs -e SSL_SUBJECT=test.example.com   paulczar/omgwtfssl
