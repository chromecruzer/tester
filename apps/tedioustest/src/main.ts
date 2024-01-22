import util from "util";
import yargs from "yargs";
import path from "path";
import {GetSqlServerData, TediousClient, TediousConfigFactory, TediousTables} from "@trac/tedious";
import PutSqlServerData from "./app/PutSqlServerData";
import sourceMap from 'source-map-support';
import _ from "lodash";
sourceMap.install();
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
const argv = yargs(process.argv.slice(2))
  .options({
    configdir: {
      type: 'string',
      describe: 'local configuration directory for the containers'
    },
    customers: {
      type: 'string',
      describe: 'either loads data from a specified file or get the existing data if their is no file'
    },
    products: {
      type: 'string',
      describe: 'either loads data from a specified file or get the existing data if their is no file'
    },
    mappings: {
      type: 'string',
      describe: 'either loads data from a specified file or get the existing data if their is no file'
    },
    salesreps: {
      type: 'string',
      describe: 'either loads data from a specified file or get the existing data if their is no file'
    }
  })
  .default({
    configdir: path.join(process.cwd(), 'config'),
  })
  .demandOption(['configdir'], 'Need to specify the configuration directory')
  .help('?')
  .alias({
    '?': 'help',
  })
  .argv;
console.log(`arguments ${dump(argv)}`);
const  exec = async () => {
  const config = await TediousConfigFactory.load(path.join(argv['configdir'], 'tediousConfig.json'));
  // console.log(`tedious configuration ${dump(config)}`);
  let tableName: TediousTables, file;
  switch(true) {
    case argv['customers'] === '':
      file = null;
      tableName = 'customers';
      break;
    case argv['products'] === '':
      file = null;
      tableName = 'products';
      break;
    case argv['mappings'] === '':
      file = null;
      tableName = 'mappings';
      break;
    case argv['salesreps'] === '':
      file = null;
      tableName = 'salesReps';
      break;
    case _.isString(argv['customers']):
      file = path.normalize(argv['customers']);
      tableName = 'customers';
      break;
    case _.isString(argv['products']):
      file = path.normalize(argv['products']);
      tableName = 'products';
      break;
    case _.isString(argv['mappings']):
      file = path.normalize(argv['mappings']);
      tableName = 'mappings';
      break;
    case _.isString(argv['salesreps']):
      file = path.normalize(argv['salesreps']);
      tableName = 'salesReps';
      break;
  }
  const tediousClient = new TediousClient(config);
  const request = await tediousClient.getRequest();
  console.log(`created request ${request ? 'done' : 'failed'}`);
  try {
    if(file) {
      const put = new PutSqlServerData(config, tableName);
      if(await put.exists(request)) {
        console.error(`table for ${tableName} already exists`);
        await tediousClient.release(request);
        return tediousClient.disconnect();
      }
      console.log(`inserting the data`)
      await put.insert(request,file);
      await tediousClient.release(request);
      return tediousClient.disconnect();
    }
    const get = new GetSqlServerData(config);
    console.log(`retrieving data for ${tableName}`)
    const results = await get.getTableData(request, tableName, tediousClient);
    console.log(dump(results));
    await tediousClient.release(request);
    return tediousClient.disconnect();

  } catch(err) {
    await tediousClient.release(request);
    return tediousClient.disconnect();
  }
}
exec();

