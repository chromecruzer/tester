import {BuildUrl} from "@trac/datatypes";
import _ from "lodash";

export type PageMapType = (
  'Accounts' |
  'Analytics' |
  'Details' |
  'Audit' |
  'Audited Accounts' |
  'Open Audits' |
  'Audit Upload' |
  'Audit Upload Session' |
  'Audit Work' |
  'Consignment' |
  'Customers' |
  'Data Upload' |
  'Expiration' |
  'Duplicates' |
  'Products' |
  'Products2' |
  'Login' |
  'SignUp' |
  'ChangePwd' |
  'Sales Reps' |
  'Search' |
  'Clear Search' |
  'Email Settings'
  );
export const pageMappings: { [index: string]: string } = {
  'Accounts': 'consignment/accounts',
  'Analytics': 'analytics/:upload_filetype/:session',
  'Details': 'details/:upload_filetype/:session',
  'Audit Work': 'audit/work',
  'Audited Accounts': 'audit/accounts',
  'Open Audits': 'audit/open',
  'Audit Upload': 'audit/upload/',
  'Audit Upload Session': 'audit/upload/:session',
  'Consignment': 'consignment',
  'Customers': 'data/customers',
  'Data Upload': 'data/upload',
  'Expiration': 'consignment/expiration',
  'Duplicates': 'data/duplicates',
  'Products': 'settings/products',
  'Products2': 'settings/products2',
  'Login': 'login',
  'SignUp': 'signup',
  'ChangePwd': 'changepwd',
  'Sales Reps': 'data/salesreps',
  'Search': '/search',
  'Clear Search': '/',
  'Email Settings': 'settings/email',
};
const dump = obj => JSON.stringify(obj, null, 2);

export default class PagesMap {
  private parentMap: { [index: string]: string } = {
    'audit': 'Audit',
    'consignment': 'Consignment',
    'data': 'Data',
    'settings': 'Settings',
    'orphan': 'Orphan',
  };
  private cleanUrlRegex: RegExp;

  constructor(private buildUrl = new BuildUrl()) {
    this.cleanUrlRegex = /[/]:.+$/;

  }

  page(page: PageMapType, paths: string[] = [], params: { [index: string]: (string | string[]) } = {}) {

    // console.log(`navigate to page ${page} = ${pageMappings[page]} transformed ${result}`);
    return this.buildUrl.build(this.clean(pageMappings[page]), paths, params);
  }

  private clean(url) {
    if (url) {
      return _.replace(url, this.cleanUrlRegex, '');
    }
    return url;
  }

  activeParent(url) {
    const tokens = _.filter(_.split(this.clean(url)), t => !_.isEmpty(t));
    let parent: (string | null) = null;
    if (tokens.length > 1) {
      parent = tokens[tokens.length - 2];
    }
    // console.log(`tokenize found a parent ${parent} from ${url}`);
    if (_.isNull(parent)) {
      return 'Orphan';
    }
    return this.parentMap[parent] || 'Orphan';
  }

  activePage(url) {
    if (url === '/') {
      return 'Search';
    }
    const result = _.find(_.keys(pageMappings), p => {//TODO: may have some ordering issues here
      if (p === 'Search') {
        return false;
      }
      return _.includes(url, this.clean(pageMappings[p]));
    }) || null;
    if (_.isNull(result)) {
      throw new Error(`URL ${url} does not correspond to a page`);
    }
    return result;
  }
}


