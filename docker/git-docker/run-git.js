const os = require("os");
const _ = require('lodash')
const DockerExec = require("../lib/docker-exec");

const dockerExec = new DockerExec();
const info = os.userInfo();
const pwd = process.cwd();
const sshSocket = process.env['SSH_AUTH_SOCK'];
const home = info.homedir;
const username = info.username;
const image = `${username}-git`;
const gitCmd = _.slice(process.argv, 2);
const run = async () => {
  await dockerExec.run(['--rm',
    '-v', `${home}:/home/${username}`,
    '-v', `${pwd}:/git`,
    '-v', `${sshSocket}:/ssh.socket`,
    '-e', 'SSH_AUTH_SOCK=/ssh.socket',
    image, _.join(gitCmd, ' ')]);
}
run();
// -v ${SSH_AUTH_SOCK}:/ssh.socket -e SSH_AUTH_SOCK=/ssh.socket
// -ti --rm -v ${HOME}:/root -v $(pwd):/git alpine/git <git_command>
