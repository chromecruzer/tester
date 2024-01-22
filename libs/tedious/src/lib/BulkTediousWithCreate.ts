import mssql from 'mssql';
import * as _ from "lodash";
import {TediousParam} from "./tedious";
import * as util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class BulkTediousWithCreate {
  constructor(public tableName) {
  }
  public async createAndFill(spreadsheet, request) {
    const table = new mssql.Table(this.tableName);
    table.create = true;
    const columns = this.transformColumns(spreadsheet);
    // console.log(`columns ${dump(columns)}`)
    _.forEach(columns, (p, n) => {
      table.columns.add(p.name, p.type, p.options);
    });
    // console.log(`table with headers ${dump(table)}`)
    _.forEach(spreadsheet.bulkData, r => {
      table.rows.add(..._.map(r, d => d === '' ? null : d));
    });
    // console.log(`table with headers and data ${dump(table)}`)
    return request.bulk(table);
  }

  private transformColumns(spreadsheet) {
    return _.map(spreadsheet.headers, (h, i) => {
      // console.log(`header ${h} value ${i}`)
      const cellLength = _.reduce(spreadsheet.bulkData, (accum, r) => {
        if(r[i] && accum < r[i].length) {
          accum = r[i].length;
        }
        return accum;
      }, 1);
      return {
        type: mssql.VarChar(cellLength),
        name: h,
      } as TediousParam;
    })
  }
}
