import path from "path";
import {dateNow, ExpirationCalculations, formatTracDate} from "@trac/datatypes";
import {queryRecords} from "@trac/postgresql";
import {ExpireSignatureBlock, InventoryAuditSummary, PageHeader, PdfTable, TracPdf} from "@trac/pdfkit";
import UploadManager from "../datastore/UploadManager";
import fs from "fs-extra";
import _ from "lodash";
import * as util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const storagePathFn = uploadConfig => path.join(...uploadConfig.root, 'pdfs');

export default class GeneratePdf {
  private getCustomersSql: string;
  private storagePath: string;
  private getConsignmentsSql: string;

  constructor(private apiConfig, private postgresClient, public settings, private customersTable, private getAuditData, consignmentTable) {
    this.getCustomersSql = `SELECT * FROM ${apiConfig.postgresConfig.getSchemaName()}.${customersTable}`;
    this.getConsignmentsSql = `SELECT * FROM ${apiConfig.postgresConfig.getSchemaName()}.${consignmentTable}`;
    this.storagePath = storagePathFn(apiConfig.uploadConfig);
    fs.ensureDir(this.storagePath);
  }
  public async getExpired(client, accountId, date) {
    let sql = this.getConsignmentsSql;
    if(accountId) {
      sql += ` WHERE customer_id='${accountId}'`;
    }
    sql +=';';
    return client.query(sql)
      .then(data => {
        const calc = new ExpirationCalculations(date);
        // console.log(`all expired lenses for customer ${accountId}, ${dump(result)}`)
        return calc.filterExpired(data.rows);
      })
      .catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });

  }
  public async getMissing(client, auditUuid) {
    return this.getAuditData.queryAuditItems(client, auditUuid)
      .then(records => _.filter(records, r => r.audit_match === 'Missing'));
  }
  public async generateExpired(accountId, date, tableName) {
    const client = await this.postgresClient.getClient();
    // console.log(`client ${dump(client)} postgresClient ${this.postgresClient}`)
    const expired = await this.getExpired(client, accountId, date);
    const customer = await queryRecords(client, this.getCustomersSql, 'customer_code',
      {id: accountId}).then(c => c[0])
      .finally(async () => {
        return this.postgresClient.release(client);
      });
    // console.log(`found customer ${dump(customer)} and expired ${dump(expired)}`);

    // console.log(`starting pdf  ${tableName}`)
    const pageHeader = new PageHeader(customer.name, customer.customer_code, tableName);
    const pdfTable = new PdfTable(expired, 'expired');
    // console.log(`adding pdf signature block`)
    const signature = new ExpireSignatureBlock();
    // console.log(`adding pdf table`)
    const pdfDoc = await this.genTable(pageHeader, pdfTable);
    signature.add(pdfDoc.doc);
    // console.log(`pdf created`);
    const filename = path.join(this.storagePath,
      `Expired_${customer.name.replaceAll(/[ /]/g,'_')}${UploadManager.newToken()}.pdf`);
    await pdfDoc.writeToFile(filename);
    console.log(`pdf stored in ${filename}`)
    return filename;
  }

  public async generateMissing(auditUuid, tableName) {
    // console.log(`missing pdf started`);
    const client = await this.postgresClient.getClient();
    const items = await this.getMissing(client, auditUuid);
    const location = await this.getAuditData.queryAudits(client, null, auditUuid,
      null, true);
    const customer = await queryRecords(client, this.getCustomersSql, 'customer_code',
      {id: location.location_code}).then(c => c[0])
      .finally(async () => {
        return this.postgresClient.release(client);
      });
    // console.log(`found customer ${dump(customer)} and location ${dump(location)}`);
    console.log(`creating table header from ${tableName}`);
    const pageHeader = new PageHeader(customer.name, customer.customer_code, tableName);

    const pdfTable = new PdfTable(items, 'missing');
    const inventoryAuditSummary = new InventoryAuditSummary(items.length);
    console.log(`adding pdf table ${items.length}`)
    // console.log(`adding pdf table ${dump(items)}`)
    const pdfDoc = await this.genTable(pageHeader, pdfTable)
    // console.log(`adding pdf summary`)
    inventoryAuditSummary.add(pdfDoc.doc, pdfTable.yOffset);
    // console.log(`pdf created`);
    const filename = path.join(this.storagePath,
      `Missing_${customer.name.replaceAll(/[ /]/g,'_')}${UploadManager.newToken()}.pdf`);
    // console.log('writing pdf')
    await pdfDoc.writeToFile(filename);
    console.log(`pdf stored in ${filename}`)
    return filename;
  }

  private async genTable(pageHeader, pdfTable) {
    const pdfDoc = new TracPdf();
    let done = false;
    let started = false;
    while (!done) {
      if (started) {
        pdfDoc.doc.addPage();
      } else {
        started = true;
      }
      await pageHeader.add(pdfDoc.doc);
      done = pdfTable.add(pdfDoc.doc);
      // console.log('add pdf table page');
    }
    return pdfDoc;
  }
}
