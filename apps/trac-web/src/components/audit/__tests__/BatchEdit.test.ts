import BatchEditAudit from "../BatchEditAudit";
import {DateTime} from "luxon";

describe('BatchEdit', () => {
  let rowsState, batchEdit, location;
  beforeEach(() => {
    rowsState = {
      getSelectedUuids: jest.fn().mockReturnValue(['uuid1', 'uuid2', 'uuid3']),
    }
    location = {
      uuid: 'location uuid',
      received_date: '07/21/2022',
      location_code: 'location code',
      name: 'name of location',
      scan_date: '06/23/2022',
      status: 'Open',
      auditor: 'Uncle Fester',
      scanner: 'Aunt Jemima'
    }
    jest.spyOn(DateTime, 'now').mockImplementation(() => DateTime.fromObject(
      {year: 2022, month: 7, day: 11}))
    batchEdit = new BatchEditAudit(location, 'I am a writer');
  });
  describe('setSelectedRowsState', () => {
    it('should set the selected rows state object', () => {
      batchEdit.setSelectedRowsState(rowsState);
      expect(batchEdit.selected).toEqual(rowsState);
    });
  });
  describe('matchChange', () => {
    it('should return a match change object with the selected uuids', () => {
      batchEdit.setSelectedRowsState(rowsState);
      const actual = batchEdit.matchChange('Billed');
      expect(actual).toMatchSnapshot();
    });
  });
  describe('moved', () => {
    it('should return a match change object with moved location information', () => {
      batchEdit.setSelectedRowsState(rowsState);
      const actual = batchEdit.moved('moved uuid', 'moved code');
      expect(actual).toMatchSnapshot();
    });
  });
  describe('createNote', () => {
    it('should create a note object with the correct type and content', () => {
      batchEdit.setSelectedRowsState(rowsState);
      const actual = batchEdit.createItemNote('Here is a comment\n with a return', 'Audit');
      expect(actual).toMatchSnapshot();
    });
  });
});
