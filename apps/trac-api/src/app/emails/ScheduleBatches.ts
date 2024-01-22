import _ from "lodash";
import nodemailer from 'nodemailer';
import {
  dateNow, DraftEmailType,
  EmailBatchOrder,
  emailStatusFn,
  MissingEmailsType,
  SalesRepRecord
} from "@trac/datatypes";
import {datumToSql, queryRecords} from "@trac/postgresql";
import util from "util";
import {DateTime} from "luxon";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

interface SalesEmails {
  ccs: string[];
  alternates: string[];
}

export default class ScheduleBatches {
  private getCustomerContactsSql: string;
  private getSalesJumpSql: string;
  private getSalesRepsSql: string;
  private getCustomersSql: string;
  private transporter: any;
  private timeoutHandles;
  private missingCache: { [id: string]: MissingEmailsType } | null;
  private gapInSeconds: number;
  private offset: number;
  private updateSql: string;

  constructor(public settings, private apiConfig, private postgresClient, private generatePdf, private createEmail,
              customersTable, customerContactTable, SalesJumpTable, SalesRepTable) {
    this.getCustomersSql = `SELECT * FROM ${apiConfig.postgresConfig.getSchemaName()}.${customersTable}`;
    this.getCustomerContactsSql = `SELECT * FROM ${apiConfig.postgresConfig.getSchemaName()}.${customerContactTable}`;
    this.getSalesJumpSql = `SELECT * FROM ${apiConfig.postgresConfig.getSchemaName()}.${SalesJumpTable}`;
    this.getSalesRepsSql = `SELECT * FROM ${apiConfig.postgresConfig.getSchemaName()}.${SalesRepTable}`;
    this.updateSql = `UPDATE ${apiConfig.postgresConfig.getSchemaName()}.${customersTable} SET `;
    this.transporter = nodemailer.createTransport({host: apiConfig.mailConfig.host, port: apiConfig.mailConfig.port});
    this.timeoutHandles = [];
    this.gapInSeconds = 10;
    this.offset = DateTime.now().toSeconds();

    this.clearMissingEmailAddresses();
  }

  public clearMissingEmailAddresses() {
    this.missingCache = null as ({ [id: string]: MissingEmailsType } | null);
  }

  public async getMissingEmailAddresses() {
    if (this.missingCache) {
      return this.missingCache;
    }
    const client = await this.postgresClient.getClient()
    const allCustomers = await queryRecords(client, this.getCustomersSql, 'customer_code',
      {})
    const ids = _.map(allCustomers, ac => ac.customer_code);
    // console.log(`allCustomers ids ${dump(ids)}`);
    const accountEmails = await this.collectContactEmails(ids, client);
    const salesEmails = await this.collectSalesReps(ids, client)
      .then(salesReps => {
        // console.log(`sales reps ${dump(salesReps)}`);
        return _.reduce(salesReps, (accum, reps, id) => {
          accum[id] = _.map(_.filter(reps, r => _.isString(r.email)), sr => sr.email)
          return accum;
        }, {});
      })
      .finally(async () => {
        console.log('trying to disconnect during scheduling')
        return this.postgresClient.release(client);
      });
    // console.log(`account emails ${dump(accountEmails)}`);
    // console.log(`sales emails ${dump(salesEmails)}`);
    const result = _.reduce(allCustomers, (accum, ac) => {
      const accountId = ac.customer_code;
      // console.log(`account emails for ${accountId}
      // ${dump(accountEmails[accountId])} & sales emails ${dump(salesEmails[accountId])}`)
      accum[accountId] =
        {
          account: ac,
          accountEmails: accountEmails[accountId] || [],
          salesEmails: salesEmails[accountId] || [],
          emailStatus: emailStatusFn(accountEmails[accountId], salesEmails[accountId])
        };
      return accum;
    });
    this.missingCache = result;
    return result;
  }

  public async getDraft(order) {
    const client = await this.postgresClient.getClient()
    const accountEmails = await this.collectContactEmails([order.accountId], client);
    const salesEmails = await this.collectSalesReps([order.accountId], client)
      .finally(async () => {
        console.log('trying to disconnect during scheduling')
        return this.postgresClient.release(client);
      });
    return this.constructDraft(order, accountEmails[order.accountId] || [], salesEmails, null, false);
  }

  public async schedule(batchOrder: EmailBatchOrder) {
    const {orders, cc, isRedirect} = batchOrder;
    const client = await this.postgresClient.getClient()
    const accountEmails = await this.collectContactEmails(_.map(orders, o => o.accountId), client);
    const salesReps = await this.collectSalesReps(_.map(orders, o => o.accountId), client)
      .finally(async () => {
        console.log('trying to disconnect during scheduling')
        return this.postgresClient.release(client);
      });
    // console.log(`account ${dump(accountEmails)} sales ${dump(salesReps)}`)
    if (orders.length === 1) { // for individual emails
      await this.doSend(orders, accountEmails, salesReps, cc, isRedirect);
      return
    }
    const emailSettings = await this.settings.getEmailSetting();
    const chunks = _.chunk(orders, emailSettings.batchSize);
    console.log(`scheduling doSend with a delay of ${emailSettings.delayInSeconds} and chunk size ${emailSettings.batchSize}`);
    const now = DateTime.now().toSeconds();
    let initialOffset = this.offset - now;
    if (initialOffset < 0) {
      initialOffset = 0;
    }

    const timeoutChunkHandleArrays = _.map(chunks, (eso, index) => {
      const delay = (initialOffset + (index + 1) * emailSettings.delayInSeconds) * 1000;
      // console.log(`delay ${delay} from ${index} and ${initialOffset} now ${now}`)
      return setTimeout(async () => {
        return this.doSend(eso, accountEmails, salesReps, cc, isRedirect)
      }, delay);
    });
    this.offset = now + (emailSettings.delayInSeconds * chunks.length) + this.gapInSeconds;
    console.log(`setting offset to ${this.offset}`);
    this.timeoutHandles = [...this.timeoutHandles, ..._.flatten(timeoutChunkHandleArrays)];
  }

  public killSchedule() {
    _.forEach(this.timeoutHandles, th => clearTimeout(th));
    this.timeoutHandles = [];
  }

  private async doSend(orders, accountEmails, salesReps, cc, isRedirect) {
    // console.log(`performing doSend for ${dump(orders)}`);
    return Promise.all(_.map(orders, async o => {
      // console.log(`drafting email for order ${dump(o)}`)
      const {html, sender, tos, ccs, subject, pdfPath} =
        await this.constructDraft(o, accountEmails[o.accountId] || [], salesReps[o.accountId], cc, isRedirect);
      // console.log(`sending order ${html} with to ${tos}, cc ${ccs}, sender ${sender}, and subject ${subject}`)
      return this.transporter.sendMail({
        from: sender,
        to: tos,
        cc: ccs,
        subject,
        html,
        attachments: [{path: pdfPath}],
      });
    }))
      .then(() => this.recordSend(orders, orders[0].templateType)); //Hack assuming that all orders have the same template type

  }

  private async recordSend(orders, templateType) {
    const client = await this.postgresClient.getClient()
    let sql = this.updateSql;
    sql += `${templateType === 'Expired' ? 'last_expire_email' : 'last_audit_email'} = ${datumToSql(dateNow(), 'date')}`;
    sql += ` WHERE customer_code in (${_.map(orders, o => `'${o.accountId}'`)})`
    return client.query(sql)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      })
      .finally(() => {
        this.postgresClient.release(client);
      });
  }

  private async collectContactEmails(accountIds: string[], client) {
    const ids = _.uniq(accountIds);
    return queryRecords(client, this.getCustomerContactsSql, 'ship_to_id', {ids})
      .then(ccontacts => {
        console.log(`returned ccontacts as ${dump(ccontacts)}`)
        return _.reduce(ccontacts, (accum, c) => {
          const emails = [];
          if (_.isString(c.email)) {
            emails.push(c.email);
          }
          if (_.isString(c.email2)) {
            emails.push(c.email2);
          }
          accum[c.ship_to_id] = emails;
          // console.log(`contacts accum so far ${dump(accum)}`)
          return accum;
        }, {})
      });
  }

  private async collectSalesReps(accountIds: string[], client) {
    const ids = _.uniq(accountIds);
    const jumps = await queryRecords(client, this.getSalesJumpSql, 'customer_id', {ids});
    const sales_ids = _.uniq(_.map(jumps, j => j.salesrep_id));
    // console.log(`returned sales list as ${dump(sales_ids)}`)
    const reps = await queryRecords(client, this.getSalesRepsSql, 'salesrep_id', {ids: sales_ids})
      .then(list => {
        return _.reduce(list, (accum, l) => {
          accum[l.salesrep_id] = l;
          return accum;
        }, {})
      });
    return _.reduce(jumps, (accum, j) => {
      const rep = reps[j.salesrep_id];
      if (!_.isArray(accum[j.customer_id])) {
        accum[j.customer_id] = [];
      }
      accum[j.customer_id].push({...rep, role: j.role})
      return accum;
    }, {}) as { [id: string]: SalesRepRecord[] }
  }

  private async constructDraft(order, customerEmails, salesReps, cc, isRedirect) {
    let sender, pdfPath;
    // console.log(`yes I am drafting`);
    const emailSettings = await this.settings.getEmailSetting();
    // console.log(`found email settings ${dump(emailSettings)}`)
    const tableName = await this.createEmail.getTitle(order, 'TableName');
    const subject = await this.createEmail.getTitle(order, 'Subject');
    if (order.templateType === 'Missing') {
      sender = emailSettings.missingHeader.sender;
      pdfPath = await this.generatePdf.generateMissing(order.auditUuid, tableName);
    } else {
      sender = emailSettings.expiredHeader.sender;
      pdfPath = await this.generatePdf.generateExpired(order.accountId, order.date, tableName)
    }
    // console.log(`constructing result`)
    const salesEmails = await this.assembleCcs(salesReps, cc, isRedirect);
    const cemails = _.isEmpty(customerEmails) ? [salesEmails.alternates[0]] : customerEmails;
    const tos = isRedirect ? cc : _.uniq(cemails);
    console.log(`emails inputs ${dump(salesEmails)} ${dump(customerEmails)}${tos} outputs ${dump(cemails)} ${dump(tos)}`)
    const result: DraftEmailType = {
      ...await this.createEmail.create(order),
      tos,
      ccs: salesEmails.ccs,
      sender,
      pdfPath,
    }
    result['subject'] = this.createEmail.merge(subject, result.macros);
    // console.log(`created draft ${dump(result)}`);
    return result;
  }

  private async assembleCcs(salesReps, cc, isRedirect) {
    const result: SalesEmails = {
      ccs: [],
      alternates: [],
    };
    if (cc && !isRedirect) {
      result.ccs.push(cc);
    }
    if (isRedirect) {
      return result;
    }
    // console.log('processing result.ccs');
    const emailSettings = await this.settings.getEmailSetting();
    let rep = _.find(salesReps, s => s.role === 'STM');
    if (rep && rep.email) {
      result.alternates.push(rep.email);
      if (emailSettings.ccSTM) {
        result.ccs.push(rep.email);
      }
    }
    rep = _.find(salesReps, s => s.role === 'PDM');
    if (rep && rep.email) {
      result.alternates.push(rep.email);
      if (emailSettings.ccPDM) {
        result.ccs.push(rep.email);
      }
    }
    rep = _.find(salesReps, s => s.role === 'KAE');
    if (rep && rep.email) {
      result.alternates.push(rep.email);
      if (emailSettings.ccKAE) {
        result.ccs.push(rep.email);
      }
    }
    // console.log(`found result ${dump(result)}`);
    return result;
  }
}
