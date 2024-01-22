import {appendBulkData, appendUuids, datumToSql, queryRecords, sqlDate} from "@trac/postgresql";
import {DateTime} from "luxon";
import _ from "lodash";

const addQuotes = s => `'${s}'`;

describe('postgresql', () => {
  let mockClient;
  beforeEach(() => {
    mockClient = {
      query: jest.fn()
    }
  });
  describe('datumToSql', () => {
    it('should Should format a string properly', () => {
      const expected = 'I am a string';
      const actual = datumToSql(expected, 'string');
      expect(actual).toBe(addQuotes(expected));
    });
    it('should return a number', () => {
      const expected = 57;
      const actual = datumToSql(expected, 'number');
      expect(actual).toBe(expected);
    });
    it('should format a date property', () => {
      const expected = '10/10/2021';
      const dateTime = DateTime.fromFormat(expected, 'LL/dd/yyyy');
      const actual = datumToSql(dateTime.toJSDate(), 'date');
      expect(actual).toBe(addQuotes(expected));
    });
  });
  describe('sqlDate', () => {
    it('should parse a date correcly', () => {
      const date = '2022-06-20T05:00:00.000Z';
      const expected = '06/20/2022';
      const actual = sqlDate(date);
      expect(actual).toEqual(expected);
    });
  });
  describe('appendUuids', () => {
    it('should return a comma seperated list of uuids appended to the sql string', () => {
      const uuids = ['1uuid', '2uuid', '3uuid', '4uuid', '5uuid'];
      const actual = appendUuids('My UUIDs are (', uuids);
      expect(actual).toMatchSnapshot();
    });
  });
  describe('appendBulkData', () => {
    let mapping, data;
    beforeEach(() => {
       mapping = [
        {
          xlsxAddress: 'G',
          dataType: 'string',
          sqlLabel: 'sqlLabelString',
          sqlType: 'char(5)'
        },
        {
          xlsxAddress: 'H',
          dataType: 'number',
          sqlLabel: 'sqlLabelNumber',
          sqlType: 'integer'
        },
        {
          xlsxAddress: 'I',
          dataType: 'date',
          sqlLabel: 'sqlLabelDate',
          sqlType: 'date'
        }
      ];
       data = [
        ['string', 57, new Date('10/10/2021')],
        ['another string', 65, new Date('10/11/2021')],
        ['also a string', 123, new Date('10/12/2021')],
      ];
    });
    it('should return  properly format rows of data appended to the sql string', () => {
      const actual = appendBulkData('bulk data is (', data, mapping, false);
      expect(actual).toMatchSnapshot();
    });
    it('should return  properly format rows of data preppended with a uuid appended to the sql string', () => {
      const actual = appendBulkData('bulk data is (', data, mapping);
      expect(actual).toMatchSnapshot();
    });
    it('should work even with a uuid appended to each row', () => {
      const appended = _.map(data, (row, i) => {
        row.unshift(`created-uuid-${i}bcd`);
        return row;
      });
      const actual = appendBulkData('bulk data with uuid is (', appended, mapping, false, true);
      expect(actual).toMatchSnapshot();
    });
  });

  describe('queryRecords', () => {

    it('should query with the proper SQL when called with a uuid', () => {
      mockClient.query.mockReturnValue(Promise.resolve({rows: ['data']}));
      return queryRecords(mockClient, 'start of SELECT statement', 'id field name',
        {uuid: 'uuidForRecord'}).then(() => {
        expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
      });
    });
    it('should query with the proper SQL when called with a record ID', () => {
      mockClient.query.mockReturnValue(Promise.resolve({rows: ['data']}));
      return queryRecords(mockClient, 'start of SELECT statement', 'uuid field name',
        {id: 'idForRecord'}).then(() => {
        expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
      });
    });
    it('should query with the proper SQL when called with a set of IDs', () => {
      mockClient.query.mockReturnValue(Promise.resolve({rows: ['data']}));
      return queryRecords(mockClient, 'start of SELECT statement', 'id field name',
        {ids: ['id1', 'id2', 'id3']}).then(() => {
        expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
});
