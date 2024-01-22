const fs = require("fs-extra");
const util = require("util");
const {join} = require("lodash");
const TracProcess = require("./trac-process");
const {dbUser} = require("./settings");
const path = require("path");

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const dbConfig = {
  user: dbUser,
  rootdatabase: "postgres",
  database: "tracdb",
  schema: "tracschema",
  audit_schema: "tracauditschema"

};
const tediousConfig = {
  user: "Surgical.Ops1",
  server: "swiwapdbscdwp50.blamericas.bausch.com",
  database: "TableauModelData_Surgical",
  productsTable: "[dbo].[PS_Prod_Master]",
  customersTable: "[dbo].[Customer_Master_Unique]",
  mappingsTable: "[dbo].[Customer_Sales_Rep_Alignment]",
  salesRepsTable: "[dbo].[Dim_Sales_Rep]"
}
const webConfig = (port, host, version) => `window._env_ = {
  NX_API_PORT: ${port},
  ${host ? `NX_API_HOST: '${host}',` : ''}
  TRAC_VERSION: '${version}'
}`
const mailConfig = {
  host: "localhost",
  port: 1025,
  expired_sender: "BLExpired@bausch.com",
  missing_sender: "SU.Consign@bausch.com"
}

const NxExec = class {
  constructor(password = null, configDir) {
    this.dbConfig = {...dbConfig, password};
    this.dbConfigPath = path.join(configDir, './dbConfig.json');
    this.childProcess = new TracProcess();
  }
  async writeTediousConfig(path, password) {
    console.log(`tediousConfig written as ${dump({...tediousConfig, password})}`)
    await fs.writeJSON(path, {...tediousConfig, password});
  }
  async writeDbConfig(path, host, port) {
    console.log(`dbConfig written as ${dump({...this.dbConfig, host, port})}`)
    await fs.writeJSON(path, {...this.dbConfig, host, port});
  }
  async writeWebConfig(path, port, host, version) {
    await fs.writeFile(path, webConfig(port, host, version));
  }
  async writeMailConfig(path, port, host) {
    await fs.writeJSON(path, {...mailConfig, host, port});
  }
  async dbreset (host, port, clearAudit = false) {
    await this.writeDbConfig(this.dbConfigPath, host, port);
    console.log('re-creating and filling the trac database');
    const resetArgs = ['--configPath', this.dbConfigPath];
    if(clearAudit) {
     resetArgs.push('--clearAudits');
    }
    return this.childProcess.exe('nx', ['run', 'db-reset:run-script', ...resetArgs]);
  }
  async build(production) {
    const dist = './dist';
    console.log(`removing dist at ${dist}`);
    await fs.remove(dist);
    console.log('building trac-api');
    await this.childProcess.exe('nx', ['build', 'trac-api', '--skip-nx-cache']);
    return this.childProcess.exe('nx', ['build', 'trac-web', '--skip-nx-cache']);
  }
  clean () {
    return fs.remove(this.dbConfigPath);
  }
}
module.exports = NxExec;
