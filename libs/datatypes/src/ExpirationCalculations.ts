import {DateTime} from "luxon";
import _ from 'lodash';
import {NullableString, tracDateFormat} from "./datatypes";

export const ExpirationBuckets = [
  '>60',
  '30<days<60',
  '<30',
  'Expired'
];

export interface consignmentGroupRecord {
  description4: string;
  description: string;
  tooLate: number;
  lessThan30: number;
  between30and60: number;
  moreThan60: number;
}
export class ExpirationCalculations {
  private now: DateTime;

  constructor(calcDate = null as NullableString) {
    this.now = calcDate ? DateTime.fromFormat(calcDate, tracDateFormat) : DateTime.now();
  }

  public chooseBucket(consignmentRecord) {
    const expiration = _.isString(consignmentRecord.expire_date) ?
      DateTime.fromFormat(consignmentRecord.expire_date, tracDateFormat) :
      DateTime.fromJSDate(consignmentRecord.expire_date);
    // console.log(`record description 4 ${consignmentRecord.description4}
    // 5 ${consignmentRecord.description5}`,consignmentRecord);
    const diff = expiration.diff(this.now, 'days').as('days');
    // console.log(`diff ${diff} from date ${expiration} and now ${this.now}`);
    switch (true) {
      case diff <= 0:
        return 'Too Late';
      case diff < 30:
        return '<30';
      case diff < 60:
        return '30<days<60';
      default:
        return '>60';
    }
  }
  private decorateWithCss(consignmentRecord) {
    const status = this.chooseBucket(consignmentRecord);
    const bg = 'bg-gray-100'
    switch(status) {
      case 'Too Late':
        return {status, className: `text-red-600 ${bg} font-extrabold text-center`, text: 'Expired'}
      case '<30':
        return {status, className: `text-yellow-300 ${bg} font-bold text-center`, text: 'Expires In < 30 Days'}
      case '30<days<60':
        return {status, className: `text-bl-text-main ${bg} text-center`, text: 'Expires In < 60 Days'}
      default:
        return {status, className: 'text-current', text: ''}
    }
  }
  public filterRecords(records, filters) {
    switch(true) {
      case filters.premium && !filters.standard:
        return _.filter(records, r => r.product_id === 'PREM_IOLS_TOT');
      case !filters.premium && filters.standard:
        return _.filter(records, r => r.product_id === 'STAND_IOLS_TOT');
      default:
        return records;
    }
  }
  public decorateRecords(records)  {
    // console.log('records to decorate', records);
    return _.map(records, r => {
      const result = {...r};
      const status = this.decorateWithCss(r);
      result.expire_status = status.text;
      result.expire_status_css = status.className;
      return result;
    })
  }
  public groupConsignments(records, filters) {
    const filtered = this.filterRecords(records, filters);
    const groups = _.groupBy(filtered, r => r.description4);
    // console.log('filtered', filtered);
    // console.log('groups by descr4', groups);
    return _.map(groups, (groupedRecords, group) => this.groupBuckets(groupedRecords, group));
  }
  public filterExpired(records) {
    return _.filter(records, r => this.chooseBucket(r) === 'Too Late')
  }

  private groupBuckets(records, descr4) {
    const buckets = _.groupBy(records, r => this.chooseBucket(r));
    const total = _.reduce(_.values(buckets), (accum, b) => {
      accum += b.length;
      return accum;
    }, 0);
    // console.log(`grouped buckets ${descr4}`, buckets, records);
    return {
      description4: descr4,
      total,
      tooLate: buckets['Too Late']?  buckets['Too Late'].length : 0,
      lessThan30: buckets['<30'] ? buckets['<30'].length : 0,
      between30and60: buckets['30<days<60'] ? buckets['30<days<60'].length : 0,
      moreThan60: buckets['>60'] ? buckets['>60'].length : 0,
    }
  }
}
