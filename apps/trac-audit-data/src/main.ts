import path from 'path';
import yargs from "yargs";
import util from "util";
import sourceMap from 'source-map-support';
import {PostgresConfigFactory} from "@trac/postgresql";
import TracProcess from "./app/TracProcess";
import * as fs from "fs-extra";
import _ from "lodash";
sourceMap.install();


const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const defaultFile = path.join(process.cwd(), 'auditData.dump')
const argv = yargs(process.argv.slice(2))
  .options({
    restore: {
      type: 'boolean',
      describe: 'restore from sql dump file',
      alias: 'r'
    },
    backup: {
      type: 'boolean',
      describe: 'save to sql dump file',
      alias: 'b'
    },
    sqlFile: {
      type: 'string',
      describe: 'sql dump file name',
      alias: 'f'
    },
    configPath: {
      type: 'string',
      default: path.join(process.cwd(), 'config', 'dbConfig.json'),
      describe: 'path to the database configuration'
    },
  })
  .default({
    sqlFile: defaultFile,
  })
  .help('?')
  .alias({
    '?': 'help',
  })
  .argv;
console.log(`arguments ${dump(argv)}`);
const configPath = argv['configPath'];
const childProcess = new TracProcess();
let tracConfig, dbConfig, dumpArgs;

const initialize = async () => {
  tracConfig = await PostgresConfigFactory.load(configPath);
  dbConfig = tracConfig.getTracConfig();
  childProcess.setEnv('PGPASSWORD', dbConfig.password)
  dumpArgs = ['-p', dbConfig.port, '-U', dbConfig.user];
  if(dbConfig.host) {
    dumpArgs = [...dumpArgs, '-h', dbConfig.host];
  }
}
const sqlDump =  () => {
  console.log('exporting audit data from the trac database');
  console.log(`arguments for pg_dump ${dump([...dumpArgs, tracConfig.getDbName()])}`);
  return childProcess.exe('pg_dump',  [...dumpArgs, '-n', tracConfig.getAuditSchemaName(), '-Fc', tracConfig.getDbName()]);
}
const sqlRestore =  () => {
  console.log('restore audit data to the trac database');
  console.log(`arguments for pg_dump ${dump([...dumpArgs, tracConfig.getDbName()])}`);
  return childProcess.exe('psql',  [...dumpArgs, tracConfig.getDbName()]);
}
const exec = async () => {
  await initialize();
  if (argv['backup']) {
    await sqlDump();
    fs.outputFile(argv['sqlFile'],_.join(childProcess.out,'\n'));
    // console.log(`output [${dump(childProcess.out)}]`);
  }
}
exec();
