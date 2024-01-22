import _ from 'lodash';
import util from "util";
import {SearchSignature, consignmentSearchSignature, customerTextSearchFields, customerContactTextSearchFields,
  productTextSearchFields, salesRepsTextSearchFields} from '../../datatypes/src';
import {searchTableNamesFn} from "./postgresql";
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class SearchTable {
  private readonly createTableSql;
  private readonly insertDocumentsSql;
  private readonly searchInsertSql;
  private readonly tableName = 'searchCache';
  private readonly outputLimit = 1200;
  private searchSignatures: {[id: string]: SearchSignature};
  private removeTableSql: string;
  constructor(private schemaName: string) {
    this.createTableSql = `CREATE TABLE ${schemaName}.${this.tableName}
(uuid UUID, schema varchar(20), tableName varchar(20), document tsvector);`;
    this.removeTableSql = `DROP TABLE ${schemaName}.${this.tableName}`;
    this.insertDocumentsSql = `WITH searchTable AS (SELECT uuid, to_tsvector(\n`;
    this.searchInsertSql = `INSERT INTO ${schemaName}.${this.tableName} VALUES (`;
    this.searchSignatures = {
      'tracschema.consignments': new SearchSignature(consignmentSearchSignature),
      'tracschema.customers': new SearchSignature(customerTextSearchFields),
      'tracschema.customer_contacts': new SearchSignature(customerContactTextSearchFields),
      'tracschema.products': new SearchSignature(productTextSearchFields),
      'tracschema.salesreps': new SearchSignature(salesRepsTextSearchFields),
    };
  }
  public createTable(client) {
    return client.query(this.createTableSql).catch(err => {
      throw new Error(`Mistake in '${this.createTableSql}' caused ${err.message}`);
    });
  }
  public removeTable(client) {
    return client.query(this.removeTableSql).catch(err => {
      throw new Error(`Mistake in '${this.removeTableSql}' caused ${err.message}`);
    });
  }
  public async fillTable(schemaName, tableName, client) {
    let sql = this.insertDocumentsSql;
    let firstConcat = false;
    console.log(`filling search table from ${schemaName}.${tableName}`)
    this.searchSignatures[`${schemaName}.${tableName}`].getSearchFields().forEach(sf => {
      sql += `${firstConcat ? ` || ' ' || ` : ''} coalesce(${sf}, '')`;
      firstConcat = true;
    });
    sql += `) AS doc from ${schemaName}.${tableName})
    INSERT INTO ${this.schemaName}.${this.tableName}
    SELECT uuid, '${schemaName}', '${tableName}', doc from searchTable;`;
    // console.log(`search fill table sql ${sql}`)
    return client.query(sql).then(result => result.rows).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }
  static setFilters(filters) {
    return ` AND tablename IN (${_.join(_.map(filters, f => `'${f}'`))})`;
  }
  public async search(text, filters, client) {

    const sql = this.searchQuerySqlFunc(text, (!_.isEmpty(filters) ? SearchTable.setFilters(filters) : null));
     console.log(`searching for "${text}" and filter ${dump(filters)} is it empty ${_.isEmpty(filters)} with ${sql}`);
    if(text === '') {
      throw new Error(`Search Text is empty`);
    }
    const results = await client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`)});
    const groupedUuids = _.reduce(results.rows, (accum, r) => {
      const dbSignature = `${r.schema}.${r.tablename}`;
      accum[dbSignature] = accum[dbSignature] || [];
      accum[dbSignature].push(r.uuid);
      return accum;
    }, {});
    // console.log(`grouped uuids ${dump(groupedUuids)}`);
    return Promise.all(_.keys(groupedUuids).map(async k => {
        let sql = `select * from ${k} where uuid in (`;
        let firstComma = false;
        // console.log(`processing ${k} group of ${dump(groupedUuids[k])}`);
        groupedUuids[k].forEach(u => {
          sql += `${firstComma ? ',':''} '${u}'`;
          firstComma = true;
        });
        sql += ');';
      // console.log(`finding uuids for "${k}"`);
      // console.log(`records ${dump(this.searchSignatures[k])}`);
      return client.query(sql)
          .then(rsp => rsp.rows.map(r => this.searchSignatures[k].createSearchRecord(r,text))
            .filter(r => r.field !== null))
          .catch(err => {
            throw new Error(`Mistake in '${sql}' caused ${err.message}`);
          });
    })).then(all => _.flatMap(all));
  }
  public uniquify(records) {
      // console.log('calling uniquify')
      const results =  _.reduce(records, (accum, record) => {
        if(accum[record.uuid]) {
          return accum;
        }
        accum[record.uuid] = record;
        return accum;
      }, {});
      // console.log(`uniquify results ${dump(results)}`);
    // console.log(`uniquify done`)
    return _.values(results);
  }
  private searchQuerySqlFunc(text, filters) {
    let polished;
    let rank;
    if(_.includes(text, ' ')) {
      const tokens = _.split(text.toLowerCase(), ' ');
      polished = `document @@ to_tsquery('${tokens[0]}')`;
      rank = tokens[0];
      tokens.forEach((t, i) => {
        if(i === 0) {
          return;
        }
        polished += ` AND document @@ to_tsquery('${t}')`
      })
    } else {
      polished = `document @@ to_tsquery('${text.toLowerCase()}:*')`;
      rank = `${text.toLowerCase()}:*`;
    }
   return `SELECT uuid, schema, tablename FROM ${this.schemaName}.${this.tableName}
WHERE ${polished} ${filters || ''}
ORDER BY ts_rank(document, to_tsquery('${rank}'))
DESC LIMIT ${this.outputLimit};`
  }
}
