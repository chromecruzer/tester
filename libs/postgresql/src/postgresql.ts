import * as _ from "lodash";
import {DateTime} from "luxon";
import {PoolClient} from "pg";
import util from "util";
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  customerContactDataMapping,
  customerDataMapping,
  dataTableNames, InputDataType,
  InputDataTypeLabel,
  InputToSqlMapping,
  iolDataMapping,
  matchCustomerContactFields,
  matchCustomerFields,
  matchIolFields,
  matchProductFields,
  matchSalesMappingFields,
  matchSalesRepFields,
  NullableString,
  productDataMapping,
  employeeRecordDm,
  salesMappingDataMapping,
  salesRepDataMapping,
  tracDateFormat, 
  UploadRecord,
  matchEmployeeFields,
  userRecordDm,
  matchUser1Fields
} from "../../datatypes/src";
import path from "path";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export const auditTableNames = {
  notes: 'auditnotes',
  locations: 'auditlocation',
  items: 'audititem',
}



export const searchTableNamesFn = () => [
  dataTableNames.consignments,
  dataTableNames.customers,
  dataTableNames.customerContacts,
  dataTableNames.products,
  dataTableNames.salesReps];

export const sqlDate = (datum: (Date | string)) => {
  // console.log(`datum ${dump(datum)}
  // from JSDate ${dump(DateTime.fromJSDate(datum))}
  // to format ${dump(DateTime.fromJSDate(datum).toFormat(tracDateFormat))}`)
  const date = _.isDate(datum) ? datum : new Date(datum);
  return DateTime.fromJSDate(date).toFormat(tracDateFormat)
}

export function datumToSql(datum: (string | number | Date | boolean), datatype: InputDataTypeLabel) {
  if (_.isNull(datum) || _.isUndefined(datum) || datum === '') {
    return 'NULL';
  }
  let str;
  switch (datatype) {
    case 'string':
      str = String(datum);
      if (str.length === 0) {
        return null;
      }
      str = str.replace(/'/g, "''");
      str = str.replace(/\n/g, "\\n");
      return `'${str}'`;
    case 'date':
      // console.log(`date ${datum} converted ${sqlDate(datum as unknown as Date)}`)
      return `'${sqlDate(datum as Date)}'`
    case 'boolean':
      // console.log(`boolean ${datum} as ${Boolean(datum)}`)
      return Boolean(datum);
    case 'number':
      return datum;
  }
}

export function appendUuids(sql: string, uuids: string[]) {
  let skipped1st = false;
  let result = sql;
  uuids.forEach(id => {
    result += `${skipped1st ? ',' : ''}    \n'${id}'`;
    skipped1st = true;
  });
  result += ');';
  return result;
}

export const checkModified = modified => {
  // console.log(`Checking ${dump(modified)}`);
  if (modified.originalUuid !== modified.new.uuid) {
    console.error(`UUID mismatch found ${dump(modified)}`);
  }
}

export function appendBulkData(sql, bulkData: UploadRecord[],
                               columnMapping: InputToSqlMapping[],
                               createUuid = true,
                               hasUuid = false) {
  let skipped1stRow = false;
  let result = `${sql}\n`;
  bulkData.forEach((record) => {
    // console.log(`append bulk data ${dump(record)}`)
    const dataRow = [];
    if (createUuid) {
      dataRow.push('gen_random_uuid()')
    }
    if(hasUuid) {
      dataRow.push(datumToSql(record['uuid'], 'string'));
    }
    columnMapping.forEach((colMap) => {
      let datum = datumToSql(record[colMap.sqlLabel], colMap.dataType);
      if(!_.isUndefined(colMap.default) && datum === null) {
        datum = colMap.default;
      }
      dataRow.push(datum)
    });
    result += `${skipped1stRow ? ',': ''}\n(${_.join(dataRow, ', ')})`;
    skipped1stRow = true;
  });
  return result;
}

export const queryRecords = async (client: PoolClient, recordSql: string, idField: string,
                                   {
                                     uuid = null as NullableString,
                                     id = null as NullableString,
                                     ids = [] as string[],
                                   }) => {
  let sql = recordSql;
  const check = (_.isString(uuid) ? 1 : 0) + (_.isString(id) ? 1 : 0) + (_.isEmpty(ids) ? 0 : 1);
  if (check > 1) {
    throw new Error(`cannot set multiple parameters ${uuid}, ${id}, ${ids.length}`);
  }
  if (uuid) {
    sql += ` WHERE uuid='${uuid}'`;
  }
  if (id) {
    sql += ` WHERE ${idField}='${id}'`;
  }
  if (!_.isEmpty(ids)) {
    sql += ` WHERE ${idField} IN (${_.join(_.map(ids, i => `'${i}'`), ', ')})`;
  }
  sql += ';';
  // console.log(`query records sql '${sql}'`);
  return client.query(sql)
    .then(data => data.rows)
    .catch(err => {
    throw new Error(`Mistake in '${sql}' caused ${err.message}`);
  });
}

interface TransformerKeys {
  matchFields: (string | string[]);
  matchFn: (a: any, b: any) => boolean,
  mappings: InputToSqlMapping[];
  compareFieldList?: string[],
}

export const recordFromArray = (row: InputDataType[], mapping: InputToSqlMapping[]) => {
  return _.reduce(mapping, (accum, m,i) => {
    const r = row[i] || null;
    let value = _.isFunction(m.nullify) ? m.nullify(r) : r;
    if(_.has(m, 'default')) { //need to us _.has here because the default may be a boolean false
      // console.log(`checking default for ${dump(m)} with value ${value}`)
      value = value || m.default;
    }
    accum[m.sqlLabel] = value;
    return accum;
  }, {} as UploadRecord);
}
export const transformHelpers: { [id: string]: TransformerKeys } = {
  iol: {
    matchFields: 'lot',
    matchFn: matchIolFields,
    mappings: iolDataMapping,
  },
  customers: {
    matchFields: 'customer_code',
    matchFn: matchCustomerFields,
    mappings: customerDataMapping,
  },
  customer_contacts: {
    matchFields: ['full_name', 'ship_to_id'],
    matchFn: matchCustomerContactFields,
    mappings: customerContactDataMapping,
  },
  products: {
    matchFields: 'product_id',
    matchFn: matchProductFields,
    mappings: productDataMapping,
  },
  employee: {
     matchFields: 'emp_id',
     matchFn: matchEmployeeFields,          // added by shyam for testing
     mappings: employeeRecordDm,
  },

  users: {
    matchFields: 'username',
    matchFn:  matchUser1Fields,              // added by shyam for testing
    mappings: userRecordDm
  },
  salesmappings: {
    matchFields: 'customer_ship_to',
    matchFn: matchSalesMappingFields,
    mappings: salesMappingDataMapping,
    compareFieldList: ['customer_ship_to', 'postal', 'zipcode', 'primary_territory', 'primary_name', 'cos_territory',
      'cos_name', 'kae_territory', 'kae_name'],
  },
  salesreps: {
    matchFields: 'salesrep_id',
    matchFn: matchSalesRepFields,
    mappings: salesRepDataMapping,
  },
}
export const matchFieldFn = (fields, record) => {
  return _.isArray(fields) ? _.join(_.map(fields, f => record[f]), '|') : record[fields]
}
export const deepEqualFn = (c, m, compareFieldList = null) => {
  if (_.isArray(compareFieldList)) {
    return _.reduce(compareFieldList,
      (boolAccum, cf) => {
        if (!boolAccum) {
          return boolAccum;
        }
        // console.log(`comparing isequal field ${cf}, ${candidate[cf]} to ${m[cf]}`);
        return _.isEqual(c[cf], m[cf]);
      }, true);
  }
  return _.isEqual(m, c);
}
export const docxTemplateFn = (apiConfig, templateType) => path.join(apiConfig.templatesPath,
  (templateType === 'Missing' ? 'missingTemplate.docx' : 'expiredTemplate.docx'))
export const htmlTemplateFn = (apiConfig, templateType) => path.join(apiConfig.templatesPath,
  (templateType === 'Missing' ? 'missingTemplate.html' : 'expiredTemplate.html'))

