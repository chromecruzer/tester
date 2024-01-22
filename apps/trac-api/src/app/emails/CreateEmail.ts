import fs from "fs-extra";
import util from "util";
import {htmlTemplateFn, queryRecords} from "@trac/postgresql";
import {MacroType} from "@trac/datatypes";
import _ from "lodash";

export type TitleType = ('TableName' | 'Subject');

export enum MacroLabelsEnum {
  date = 'Date',
  customerName = 'CustomerAccountName',
  customerNumber = 'CustomerAccountNumber',
  numberItems = 'NumberOfItems'
}

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class CreateEmail {
  private getCustomersSql: string;
  private missingTemplate: string;
  private expiredTemplate: string;

  constructor(private generatePdf, private apiConfig, private postgresClient, customersTable) {
    this.getCustomersSql = `SELECT * FROM ${apiConfig.postgresConfig.getSchemaName()}.${customersTable}`;

  }

  static initialze(generatePdf, apiConfig, postgresClient, customersTable) {
    const myself = new CreateEmail(generatePdf, apiConfig, postgresClient, customersTable);
    myself.loadTemplate('Missing');
    myself.loadTemplate('Expired');
    return myself;
  }

  async loadTemplate(templateType) {
    const extension = (templateType === 'Missing' ? 'missingTemplate' : 'expiredTemplate');
    this[extension] =
      await fs.readFile(htmlTemplateFn(this.apiConfig, templateType), 'utf8')
        .catch(err => {
          console.error(`Missing template for ${extension} ${err}`);
          return null;
        });
    console.log(`template loaded for ${extension}`)
  }

  public async create(order) {
    const client = await this.postgresClient.getClient();
    const customer = await this.getCustomer(client, order);
    // console.log(`found customer ${dump(customer)}`);
    const macros = await this.createMacros(client, order, customer);
    // console.log(`generated macros ${dump(macros)}`);
    // console.log(`setup template is finished`);
    const template = order.templateType === 'Missing' ? this.missingTemplate : this.expiredTemplate;
    return {
      ...order,
      macros,
      html: this.merge(template, macros),
    }
  }

  private async getCustomer(client, order) {
    return queryRecords(client, this.getCustomersSql, 'customer_code',
      {id: order.accountId}).then(c => c[0])
  }

  private async createMacros(client, order, customer) {
    let items;
    if (order.templateType === 'Expired') {
      items = await this.generatePdf.getExpired(client, order.accountId, order.date)
        .finally(async () => {
          return this.postgresClient.release(client);
        });
    } else {
      items = await this.generatePdf.getMissing(client, order.auditUuid, order.date)
        .finally(async () => {
          return this.postgresClient.release(client);
        });
    }
    return {
      [MacroLabelsEnum.date]: order.date,
      [MacroLabelsEnum.customerName]: customer.name,
      [MacroLabelsEnum.customerNumber]: order.accountId,
      [MacroLabelsEnum.numberItems]: items.length,
    }
  }

  public merge(html, macros: MacroType) {
    let result = html;
    _.forEach(macros, (v, k) => {
      const macroRegex = new RegExp(`\\{\\s*${k}\\s*\\}`, 'g');
      // console.log(`macro ${macroRegex.source}`);
      result = result.replaceAll(macroRegex, v);
    })
    // console.log(`resulting merge '${result}'`);
    return result;
  }

  public async getTitle(order, type: TitleType) {
    const client = await this.postgresClient.getClient();
    const customer = await this.getCustomer(client, order);
    const macros = await this.createMacros(client, order, customer);
    const settings = await this.generatePdf.settings.getEmailSetting();
    console.log(`setting ${dump(settings)}`);
    let title;
    switch (true) {
      case type === 'TableName' && order.templateType === 'Expired':
        title = settings.expiredHeader.attachmentTableName;
        break;
      case type === 'TableName' && order.templateType === 'Missing':
        title = settings.missingHeader.attachmentTableName;
        break;
      case type === 'Subject' && order.templateType === 'Expired':
        title = settings.expiredHeader.subject;
        break;
      case type === 'Subject' && order.templateType === 'Missing':
        title = settings.missingHeader.subject;
        break;
    }
    return this.merge(title, macros);
  }
}
