import {DateTime} from "luxon";
import {ExpirationCalculations, tracDateFormat} from "@trac/datatypes";
import * as util from "util";
import _ from "lodash";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

describe('ExpirationCalculations', () => {
  let twoGroupRecords, expiredRecords, records30, records60, babies, now, calcs;
  beforeEach(() => {
    now = DateTime.fromObject({year: 2021, month: 10, day: 10});
    twoGroupRecords = [
      {
        product_id: 'PREM_IOLS_TOT',
        item: 'premium item 1 border case',
        expire_date: DateTime.fromObject({year:2021, month:12, day:10}).toJSDate(),
      },
      {
        product_id: 'STAND_IOLS_TOT',
        item: 'standard item 1 border case',
        expire_date: DateTime.fromObject({year:2021, month:12, day:20}).toJSDate(),
      },
      {
        product_id: 'PREM_IOLS_TOT',
        item: 'premium item 2',
        expire_date: DateTime.fromObject({year:2021, month:12, day:21}).toJSDate(),
      },
      {
        product_id: 'STAND_IOLS_TOT',
        item: 'standard item 2',
        expire_date: DateTime.fromObject({year:2021, month:12, day:21}).toJSDate(),
      },
      {
        product_id: 'PREM_IOLS_TOT',
        item: 'premium item 3',
        expire_date: DateTime.fromObject({year:2022, month:12, day:20}).toJSDate(),
      },
      {
        product_id: 'STAND_IOLS_TOT',
        item: 'standard item 3',
        expire_date: DateTime.fromObject({year:2022, month:12, day:25}).toJSDate(),
      }
    ];
    expiredRecords = [
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item 1 border case',
        expire_date: DateTime.fromObject({year:2021, month:10, day:10}).toJSDate(),
      },
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item 1 border case',
        expire_date: DateTime.fromObject({year:2021, month:10, day:9}).toJSDate(),
      },
      {
        product_id: 'STAND_IOLS_TOT',
        description4: 'standard item 1 border case',
        expire_date: DateTime.fromObject({year:2021, month:4, day:7}).toJSDate(),
      },
    ];
    records30 = [
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item 1 30 days',
        expire_date: DateTime.fromObject({year:2021, month:11, day:9}).toJSDate(),
      },
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item 1 30 days',
        expire_date: DateTime.fromObject({year:2021, month:11, day:8}).toJSDate(),
      },
      {
        product_id: 'STAND_IOLS_TOT',
        description4: 'standard item 1 30 days',
        expire_date: DateTime.fromObject({year:2021, month:10, day:31}).toJSDate(),
      },
    ];
    records60 = [
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item 60 days',
        expire_date: DateTime.fromObject({year:2021, month:11, day:10}).toJSDate(),
      },
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item 60 days',
        expire_date: DateTime.fromObject({year:2021, month:11, day:11}).toJSDate(),
      },
      {
        product_id: 'STAND_IOLS_TOT',
        description4: 'standard item 60 days',
        expire_date: DateTime.fromObject({year:2021, month:12, day:8}).toJSDate(),
      },
    ];
    babies = [
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item >60 days',
        expire_date: DateTime.fromObject({year:2022, month:1, day:10}).toJSDate(),
      },
      {
        product_id: 'PREM_IOLS_TOT',
        description4: 'premium item >60 days',
        expire_date: DateTime.fromObject({year:2022, month:1, day:11}).toJSDate(),
      },
      {
        product_id: 'STAND_IOLS_TOT',
        description4: 'standard item >60 days',
        expire_date: DateTime.fromObject({year:2022, month:1, day:8}).toJSDate(),
      },
    ];
    calcs = new ExpirationCalculations();
    calcs.now = now;
  });
  describe('filterRecords', () => {
    it('should only return records with a specific product id', () => {
          const actual = calcs.filterRecords(twoGroupRecords, {standard: true});
          expect(actual).toMatchSnapshot();
    });
  });
  describe('groupConsignments', () => {
    it('should return the correct number of expired lenses', () => {
      const actual = calcs.groupConsignments(expiredRecords, {});
      expect(actual).toMatchSnapshot();
    });
    it('should return the correct number of < 30 lenses', () => {
      const actual = calcs.groupConsignments(records30, {});
      expect(actual).toMatchSnapshot();
    });
    it('should return the correct number of < 60 lenses', () => {
      const actual = calcs.groupConsignments(records60, {});
      expect(actual).toMatchSnapshot();
    });
    it('should return the correct number of > 60 lenses', () => {
      const actual = calcs.groupConsignments(babies, {});
      expect(actual).toMatchSnapshot();
    });
  });
  describe('decorateRecords', () => {
    it('should calculate text date correctly and added the correct label and css', () => {
      const textDateRecords = _.map([...expiredRecords, ...records30, ...records60, ...babies], r => ({...r,
        expire_date: DateTime.fromJSDate(r.expire_date).toFormat(tracDateFormat)}));
      // console.log(`texted dates ${dump(textDateRecords)}`)
      const actual = calcs.decorateRecords(textDateRecords);
      expect(actual).toMatchSnapshot();
    });
  });
});
