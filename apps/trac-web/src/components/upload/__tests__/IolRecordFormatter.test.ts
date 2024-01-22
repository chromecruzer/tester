import IolRecordFormatter from "../IolRecordFormatter";
import {DateTime} from "luxon";
import {tracDateFormat} from "@trac/datatypes";

describe('IolRecordFormatter', () => {
  describe('#formatRowValues', () => {
    it('should format the dates of an iol record', () => {
      const formatter = new IolRecordFormatter({
        adds: [],
        removes: [],
        modifies: []
      });
      const actual = formatter.formatRowValues({
        received_date: DateTime.utc(2016, 3, 26).toFormat(tracDateFormat),
        expire_date: DateTime.utc(2014, 3, 16).toFormat(tracDateFormat),
        shipped_date: DateTime.utc(2016, 3, 6).toFormat(tracDateFormat),
      });
      expect(actual).toMatchSnapshot();
    });
  });
});
