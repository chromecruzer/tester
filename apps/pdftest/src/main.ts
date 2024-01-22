import {ExpireSignatureBlock, PageHeader, TracPdf, PdfTable, InventoryAuditSummary} from "@trac/pdfkit";
import _ from "lodash";
import util from "util";
import GenerateConsignmentData from "./app/GenerateConsignmentData";
import yargs, {exit} from "yargs";
import path from "path";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const docPath = './texxstDoc.pdf';

const pdfdoc = new TracPdf();
const signature = new ExpireSignatureBlock();
const argv = yargs(process.argv.slice(2))
  .options({
    missing: {
      type: 'number',
      describe: 'number of missing items for a table',
      conflicts: 'expired'
    },
    expired: {
      type: 'number',
      describe: 'number of expired items for a table',
      conflicts: 'missing'
    }
  })
  .help('?')
  .alias('?', 'help')
  .argv;
let numRecords, type;
console.log(`running with argv ${dump(argv)}
     expired ${argv['expired']}
     missing ${argv['missing']}`);
switch(true) {
  case _.isNumber(argv['missing']):
    numRecords = argv['missing'];
    type = 'missing';
    break;
  case _.isNumber(argv['expired']):
    numRecords = argv['expired'];
    type = 'expired';
    break;
  default:
    console.log('missing or expired need to be included as an argument!!!!!!');
}
console.log(`running ${type} with ${numRecords} records`);
const pageHeader = new PageHeader('Precision Vision Surgery Center LLC', '01234927',
  `${type === 'missing' ? 'Intraocular Lens (IOL) Inventory Audit' : 'Expired List'} - 08 -05 -2022`);
const gen = new GenerateConsignmentData(type);
const pdfTable = new PdfTable(gen.generate(numRecords), type);
const inventoryAuditSummary = new InventoryAuditSummary(numRecords);
const execute = async () => {
  let done = false;
  let started = false;
  while(!done) {
    if(started) {
      pdfdoc.doc.addPage();
    } else {
      started = true;
    }
    await pageHeader.add(pdfdoc.doc);
    done = pdfTable.add(pdfdoc.doc);
  }
  if(type === 'expired') {
    signature.add(pdfdoc.doc);
  } else {
    inventoryAuditSummary.add(pdfdoc.doc, pdfTable.yOffset);
  }
  return pdfdoc.writeToFile(docPath);
}
execute();
