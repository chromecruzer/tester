const yamlConverter = require('js-yaml');
const fs = require('fs-extra');
const _ = require('lodash');
const util = require("util");
const TracProcess = require("./trac-process");
const path = require("path");
const {
  containerName,
  setPorts,
  deployment,
  uploadDir,
  outsidePorts,
  configDirName,
  workDir,
  networkName
} = require("./settings");

const exec = require('node:child_process').exec;

const pexec = (cmd, options) => {

}

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const dockerComposeExec = args => (['docker compose', args]);
const composeDb = production => ({
  //TODO make sure the outside port is closed.
  ports: [setPorts('db', production)],
  image: 'postgres:latest',
  container_name: containerName('db', production),
  volumes:
    [{
      type: "volume",
      source: `${deployment(production)}-pgdata`,
      target: '/var/lib/postgresql/data/pgdata',
    }],
  environment: {
    POSTGRES_PASSWORD: "${DBPASSWORD}",
    POSTGRES_USER: "${DBUSER}",
    PGDATA: '/var/lib/postgresql/data/pgdata',
  },
  networks: {}
});
const composeApi = (version, isProduction, configDir) => {
  const composition = {
    image: `trac/api:${version}`,
    ports: [setPorts('api', isProduction)], //TODO: this needs to be replaced by an expose command to close the outside port
    container_name: containerName('api', isProduction),
    volumes:
      [{
        type: 'volume',
        source: `${deployment(isProduction)}-uploads`,
        target: _.join(uploadDir, '/'),
      },
        {
          type: 'bind',
          source: path.resolve(configDir),
          target: '/var/lib/trac/config',
        }
      ],
    networks: {},
    depends_on: [`${deployment(isProduction)}-db`],
    healthcheck:
      {
        test: ["CMD-SHELL", "curl -f http://localhost:1234/api/welcome || exit 1"],
        interval: '1m30s',
        timeout: '5s',
        retries: 3,
        start_period: '10s'
      }
  };
  if (isProduction) {
    return composition;
  }
  return {
    ...composition,
    build: {
      context: '..',
      dockerfile: 'apps/trac-api/Dockerfile'
    },
  }
};

const composeWeb = (version, isProduction, configDir, certDir) => {
  const composition = {
    image: `trac/web:${version}`,
    ports: [setPorts('web', isProduction)],
    container_name: containerName('web', isProduction),
    volumes:
      [
        {
          type: 'bind',
          source: path.resolve(configDir),
          target: '/var/lib/trac/config',
        },
        {
          type: 'bind',
          source: path.resolve(certDir),
          target: '/tmp/certs'
        }
      ],
    environment: {
      NX_API_PORT: outsidePorts('api', isProduction),
    },
    networks: {},
  };
  _.set(composition, `depends_on.${deployment(isProduction)}-api`, {
    condition: 'service_healthy'
  });

  if (isProduction) {
    return composition;
  }
  return {
    ...composition,
    build: {
      context: '..',
      dockerfile: 'apps/trac-web/Dockerfile'
    },
  }
}

const DockerComposeExec = class {
  constructor(user, password, production, version, configDir = null, certDir = null, tag = null) {
    const ext = tag !== null ? `-${tag}` : '';
    this.yamlFileName = path.join(workDir(),
      `./docker-compose-trac-${production ? 'production' : 'development'}${ext}.yml`);
    this.production = production;
    this.user = user;
    this.password = password || '';
    this.version = version || null;
    this.configDir = configDir ? configDirName(configDir, production) : null;
    this.certDir = certDir || null;
    this.childProcess = new TracProcess();
    if (password) {
      this.childProcess.setEnv('DBUSER', user);
      this.childProcess.setEnv('DBPASSWORD', password);
    }
  }

  async extractVersion() {
    const pkg = await fs.readJson('./package.json');
    return pkg.version;
  }

  async up(containers, reset) {
    await this.createYaml(containers, reset);
    return this.childProcess.exe(...dockerComposeExec(['-f', this.yamlFileName, 'up', '-d', '--build']));
  }

  async down(containers) { // not using docker-compose down because we want to keep the images
    if (!await fs.pathExists(this.yamlFileName)) {
      throw new Error(`docker compose file ${this.yamlFileName} does not exist`);
    }
    await this.childProcess.exe(...dockerComposeExec(['-f', this.yamlFileName, 'stop']));
    return this.childProcess.exe('docker', ['rm', ..._.map(containers,
      c => containerName(c, this.production))]);
  }

  writeUploadConfig(path) {
    fs.writeJSON(path, {root: uploadDir});
  }

  async createYaml(containers, reset) {
    const exists = await fs.pathExists(this.yamlFileName);
    if (!this.production && exists && !reset) {
      console.log(`no need to create ${this.yamlFileName}`)
      return;
    }
    if (exists && reset) {
      await fs.remove(this.yamlFileName);
    }
    const yaml = {
      services: {},
      volumes: {},
      networks: {},
    };
    if (this.version === null) {
      this.version = await this.extractVersion()
    }
    console.log(`network is ${networkName(this.production)}`)
    yaml.networks[networkName(this.production)] = {driver: 'bridge'};
    _.forEach(containers, c => {
      switch (c) {
        case 'db':
          yaml.services[`${deployment(this.production)}-db`] = composeDb(this.production);
          yaml.services[`${deployment(this.production)}-db`].networks[`${networkName(this.production)}`] = {};
          yaml.volumes[`${deployment(this.production)}-pgdata`] = {external: true};
          return;
        case 'api':
          yaml.services[`${deployment(this.production)}-api`] = composeApi(this.version, this.production,
            this.configDir);
          yaml.services[`${deployment(this.production)}-api`].networks[`${networkName(this.production)}`] = {};
          yaml.volumes[`${deployment(this.production)}-uploads`] = {external: true};
          yaml.volumes[`${deployment(this.production)}-configs`] = {external: true};
          return;
        case 'web':
          yaml.services[`${deployment(this.production)}-web`] = composeWeb(this.version, this.production,
            this.configDir, this.certDir);
          yaml.services[`${deployment(this.production)}-web`].networks[`${networkName(this.production)}`] = {};
          yaml.volumes[`${deployment(this.production)}-configs`] = {external: true};
          return;
        default:
          throw new Error(`Container ${c} not recognized`);
      }
    });
    return fs.writeFile(this.yamlFileName, yamlConverter.dump(yaml));
  }

  clean() {
    return fs.remove(this.yamlFileName);
  }
}
module.exports = DockerComposeExec;
