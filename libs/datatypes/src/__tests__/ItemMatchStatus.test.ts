import {ItemMatchStatus} from "@trac/datatypes";

describe('ItemMatchStatus', () => {
  describe('match', () => {
    let matcher;
    beforeEach(() => {
      matcher = new ItemMatchStatus()
    });
    it('should detect a true match', () => {
      const actual = matcher.match('matched location', {customer_id: 'matched location'});
      expect(actual).toEqual('True Match');
    });
    it('should detect a moved item', () => {
      const actual = matcher.match('matched location', {customer_id: 'another location'});
      expect(actual).toEqual('Found In Other Location');
    });
  });
});
