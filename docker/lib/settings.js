const path = require("path");
const fs = require("fs-extra");

const dbUser = 'tracuser';
const uploadDir = ['/var', 'lib', 'trac', 'uploads'];
const deployment = production => {
  return production ? 'trac' : 'trac-dev';
};

const configDirName = (root, production) => path.join(root, (production ? 'production' : 'development'));

const outsidePorts = (container, production) => {
  const oPorts = {
    db: production ? 5444 : 6444,
    api: production ? 2996 : 2997,
    web: production ? 443 : 442, //TODO: These should be the only ones used. see docker-compose-exec
  }
  return oPorts[container];
}
const containerName = (container, production) => {
  const containerNames = {
    db: 'postgres',
    api: 'api',
    web: 'web',
  }
  return `${deployment(production)}-${containerNames[container]}`
}
const insidePorts = container => {
  const iPorts = {
    db: '5432',
    api: '1234',
    web: '2400',
  }
  return iPorts[container];
}
const setNat = (container, production) => {
  return `${outsidePorts(container, production)}:${insidePorts(container)}`;
};

const workDir = () => {
  const wkdir = path.join(process.cwd(), 'tmp');
  fs.ensureDir(wkdir);
  return wkdir;
}
const networkName = production => `${production ? '' : 'dev-'}trac-network`;
module.exports = {
  configDirName,
  outsidePorts,
  containerName,
  dbUser,
  deployment,
  insidePorts,
  networkName,
  setPorts: setNat,
  uploadDir,
  workDir,
};
