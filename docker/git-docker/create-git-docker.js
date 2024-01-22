const os = require("os");
const util = require("util");
const fs = require("fs-extra");
const _ = require("lodash");
const DockerExec = require("../lib/docker-exec");
const path = require("path");
// groups=0(root),1(bin),2(daemon),3(sys),4(adm),6(disk),10(wheel),11(floppy),20(dialout),26(tape),27(video)
const alpineGroups = {
  0: 'root',
  1: 'bin',
  2: 'daemon',
  3: 'sys',
  4: 'adm',
  6: 'disk',
  10: 'wheel',
  11: 'floppy',
  20: 'dialout',
  26: 'tape',
  27: 'video'
}
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
//git config --global --add safe.directory /git
const dockerfile = (info) => {
  const {username, gid, uid} = info;
  const group = alpineGroups[gid] || null;
  const runadd = _.isString(group) ? `/usr/sbin/groupadd -g ${gid} ${group} && \\
    /usr/sbin/useradd -u ${uid} -G ${group} -m ${username}` : `/usr/sbin/useradd -u ${uid} -m ${username}`;
  return `
FROM alpine:latest
RUN apk fix && \\
    apk --no-cache --update add git git-lfs gpg less bash openssh patch shadow && \\
    git lfs install
VOLUME /git
WORKDIR /git
RUN ${runadd}
USER ${username}
RUN git config --global --add safe.directory /git
ENTRYPOINT ["git"]
CMD ["--help"]
`
}
const info = os.userInfo();
const dockerPath = path.join(process.cwd(), 'tmp', 'git-docker');
const dockerFilePath = path.join(dockerPath, 'Dockerfile');
console.log(`user info ${dump(info)}`);
const dockerExec = new DockerExec();

const run = async () => {
  await fs.outputFile(dockerFilePath, dockerfile(info));
  await dockerExec.build([dockerPath, '-t', `${info.username}-git`])
}
run();
