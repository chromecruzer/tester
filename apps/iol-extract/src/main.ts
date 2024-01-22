import path from "path";
import yargs from 'yargs/yargs'
import {PostgresClient, PostgresConfigFactory, ExtractIolData} from "@trac/postgresql";
import util from "util";
import _ from "lodash";
import {dataTableNames} from "@trac/datatypes";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const argv = yargs(process.argv.slice(2))
  .choices('d', ['customers', 'products'])
  .alias('d', 'data')
  .describe('d', 'choose the data to extract from the IOL download')
  .options({
    configPath: {
      type: 'string',
      default: path.join(process.cwd(), 'config', 'dbConfig.json'),
      describe: 'path to the database configuration'
    }
  })
  .help('?')
  .alias('?', 'help')
  .argv;
// console.log(`argv processing ${dump(argv)}`)
const  exec = async () => {
  const config = await PostgresConfigFactory.load(argv['configPath']);
  const postgresClient = new PostgresClient(config);
  const iolExtract = new ExtractIolData(config, dataTableNames.iol);
  const client = await postgresClient.getClient()
  if(argv['d'] === 'customers') {
    _.forEach(_.sortBy(await iolExtract.getUniqueCustomerCodes(client)), c => {
      console.log(`'${c}',`);
    })
  } else {
    _.forEach(_.sortBy(await iolExtract.getUniqueProducts(client)), p => {
      console.log(`'${p}',`);
    })
  }
  postgresClient.release(client);
}
exec();
