import path from 'path';
import yargs from "yargs";

import sourceMap from 'source-map-support';
sourceMap.install();

import {
  PostgresClient,
  PostgresConfigFactory,
  ImportIntoConsignments,
  auditTableNames, ImportIntoJumpTable
} from "@trac/postgresql";
import {
  sqlAuditNoteRecord,
  sqlAuditLocationRecord,
  sqlAuditItemRecord,
  transformIolRecord,
  transformSalesRepsRecord, dataTableNames
} from "@trac/datatypes";
// import {
//   sqlAuditNoteRecord,
//   sqlAuditLocationRecord,
//   sqlAuditItemRecord,
//   transformIolRecord,
//   transformSalesRepsRecord,
//   dataTableNames,
// } from "@trac/datatypes";

import RecreateDatabase from "./app/RecreateDatabase";
import ImportData from "./app/ImportData";
import util from "util";
import CreateAuditTable from "./app/CreateAuditTable";

const dump = (obj, depth = null) => util.inspect(obj, { depth, colors: true });
const argv = yargs(process.argv.slice(2))
  .options({
    configPath: {
      type: 'string',
      default: path.join(process.cwd(), 'config', 'dbConfig.json'),
      describe: 'path to the database configuration'
    },
    clearAudits: {
      type: 'boolean',
      default: false,
      describe: 'drop existing audits if true'
    }
  })
  .help('?')
  .alias('?', 'help')
  .argv;

console.log(`config path is yargs ${dump(argv)}`);
const configPath = argv['configPath'];
const removeDb = argv['clearAudits'];
let config, recreateDb, postgresClient, loadIolReport, loadCustomerData, loadCustomerContactData, loadSalesRepData,
  loadSalesMappingData, loadProductData, loadEmployeeData, importSalesJumpData, loadUserData;

const testConnection = async () => {
  await recreateDb.connect();
  await recreateDb.recreate().catch(err => {
    recreateDb.disconnect();
    throw Error(`Recreate returned with an error: ${err}`);
  });
  return recreateDb.disconnect();
};


const createAudit = async () => {
  const createAudits = new CreateAuditTable(config.getAuditSchemaName());
  const client = await postgresClient.getClient();
  await createAudits.createSchema(client);
  await createAudits.create(client, auditTableNames.notes, sqlAuditNoteRecord);
  await createAudits.create(client, auditTableNames.locations, sqlAuditLocationRecord);
  await createAudits.create(client, auditTableNames.items, sqlAuditItemRecord);
  postgresClient.release(client);
}

const initialize = async () => {
  config = await PostgresConfigFactory.load(configPath);
  console.log(`config id ${dump(config.config)}`);

  recreateDb = new RecreateDatabase(config, removeDb);
  postgresClient = new PostgresClient(config);

  loadIolReport = new ImportData('IOL Report', config.getSchemaName(), postgresClient,
    dataTableNames.iol, transformIolRecord);

  loadCustomerData = new ImportData('Customer Data', config.getSchemaName(),
    postgresClient, dataTableNames.customers);

  loadCustomerContactData = new ImportData('Customer Contact Data',
    config.getSchemaName(), postgresClient, dataTableNames.customerContacts);

  loadSalesRepData = new ImportData('Sales Rep Data', config.getSchemaName(),
    postgresClient, dataTableNames.salesReps, transformSalesRepsRecord);

  loadSalesMappingData = new ImportData('Sales Mapping Data', config.getSchemaName(),
    postgresClient, dataTableNames.salesMappings);

  loadProductData = new ImportData('Product Data', config.getSchemaName(),
    postgresClient, dataTableNames.products);

  // added by me for testing

  loadEmployeeData = new ImportData('Employee Data', config.getSchemaName(),
    postgresClient, dataTableNames.employee)

  loadUserData = new ImportData('User Data', config.getSchemaName(),
    postgresClient, dataTableNames.users)

  //
  importSalesJumpData = new ImportIntoJumpTable(config.getSchemaName(), dataTableNames.salesJumpTable,
    dataTableNames.salesReps, dataTableNames.salesMappings)

}
const createConsignmentTable = async () => {
  const postgresClient = new PostgresClient(config);
  const createConsignment = new ImportIntoConsignments(config.getSchemaName(),
    dataTableNames.consignments, dataTableNames.iol, dataTableNames.products);
  const client = await postgresClient.getClient();
  console.log('Create and fill consignments table');
  await createConsignment.into(client);
  await createConsignment.removeExcluded(client);
  await createConsignment.addToSearch(client);
  return postgresClient.release(client);
}
const run = async () => {
  await initialize();
  await testConnection();
  console.log(`${removeDb ? 'db created' : 'data schema dropped'}`);

  await loadSalesRepData.import(path.join(__dirname, 'assets', '2023.02.01 SalesReps.xlsx'),
    1000, true, true);

  console.log('salesreps table created and filled')
  await loadCustomerData.import(path.join(__dirname, 'assets', '2023.02.01 Customers.xlsx'),
    5000);

  console.log('customer table created and filled')
  await loadCustomerContactData.import(path.join(__dirname, 'assets', 'Customer Contacts 09-30-22.xlsx'),
    5000);
  console.log('customer contacts table created and filled')
  await loadProductData.import(path.join(__dirname, 'assets', '2023.02.01 Products.xlsx'),
    5000);

  console.log('products table created and filled')
  await loadSalesMappingData.import(path.join(__dirname, 'assets', '2023.02.01 SalesMappings.xlsx'),
    5000, false, false);

  // added by me
  console.log('employees table populated')
  await loadEmployeeData.import(path.join(__dirname, 'assets', '2023.08.11 Employees.xlsx'),
    5000, false, false);

  console.log('users table populated')
  await loadUserData.import(path.join(__dirname, 'assets', '2023.08.11 Users.xlsx'),
    5000, false, false);

    //

  console.log('sales mappings table created and filled')
  await loadIolReport.import(path.join(__dirname, 'assets', 'IOL_Download 2023.02.01.xlsx'),
    5000, false, false);

  console.log('iol table created and filled')
  const client = await postgresClient.getClient();
  await importSalesJumpData.fill(client)
    .then(() => { console.log('jump table filled') });
  await postgresClient.release(client);
  console.log('sales jump mappings table created and filled')
  await createConsignmentTable().then(() => {
    console.log('consignments table created and filled');
  });

  if (removeDb) 
  {
    await createAudit().then(() => {
      console.log('audit tables created');
    })
  }
  return postgresClient.disconnect();
}

run().then(() => {
  console.log(`script is done`);
})
  .catch(err => console.error('script had an error', err))


