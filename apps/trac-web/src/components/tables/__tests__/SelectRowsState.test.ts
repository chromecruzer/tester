import SelectedRowsState from "../SelectedRowsState";
import * as util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

describe('SelectRowsState', () => {
  let sortedRows, contiguousSelection, discreteSelections, stateModel;
  beforeEach(() => {
    sortedRows = [
      'uuidfirst',
      'uuidsecond',
      'uuidthird',
      'uuidfourth',
      'uuidfifth',
      'uuidsixth',
      'uuidseventh',
      'uuideighth',
      'uuidninth',
      'uuidtenth',
    ];
    contiguousSelection = {
      uuidfifth:true,
      uuidsixth:true,
      uuidseventh:true,
    };
    discreteSelections = {
      uuidthird:true,
      uuidsixth:true,
      uuidfirst:false,
      uuideighth:true,
    };
    stateModel = new SelectedRowsState();
  });
  describe('updateRowOrder', () => {
    it('should set up the row order based on the array', () => {
      const expected = {
        "uuideighth": 7,
        "uuidfifth": 4,
        "uuidfirst": 0,
        "uuidfourth": 3,
        "uuidninth": 8,
        "uuidsecond": 1,
        "uuidseventh": 6,
        "uuidsixth": 5,
        "uuidtenth": 9,
        "uuidthird": 2
      }
      stateModel.updateRowOrder(sortedRows);
      expect(stateModel.rowOrder).toEqual(expected);
    });
  });
  describe('isSelected', () => {
    it('should return true if a row has been selected', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      expect(stateModel.isSelected('uuidsixth')).toEqual('selected-row')
    });
    it('should return false if a row does not exist in the selected map', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      expect(stateModel.isSelected({uuid: 'uuidfifth'})).toEqual('normal-row')
    });
    it('should return false if the selected row is set to false', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      expect(stateModel.isSelected({uuid: 'uuidfirst'})).toEqual('normal-row')
    });
  });
  describe('clear', () => {
    it('should empty the selected rows map', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      stateModel.clear();
      expect(stateModel.selectedRows).toEqual({});
    });
  });
  describe('click', () => {
    it('should set the selected row and clear the old selections', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      stateModel.click('uuidfifth');
      expect(stateModel.getSelectedUuids()).toEqual(['uuidfifth']);
    });
  });
  describe('controlClick', () => {
    it('should set the selected row and without clearing the old selections', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      stateModel.controlClick('uuidfifth');
      expect(stateModel.getSelectedUuids()).toEqual([
        "uuideighth",
        "uuidfifth",
        "uuidsixth",
        "uuidthird"
    ]);
    });
  });
  describe('shiftClick', () => {
    it('should set one selection if there are none', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.shiftClick('uuidfifth');
      expect(stateModel.getSelectedUuids()).toEqual(['uuidfifth']);
    });
    it('should set a block of selections if there is only one previous selection', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.shiftClick('uuidfirst');
      stateModel.shiftClick('uuidfourth');
      expect(stateModel.getSelectedUuids()).toEqual([  "uuidfirst",
        "uuidfourth",
        "uuidsecond",
        "uuidthird"
      ]);
    });
    it('should set adjust a block of selections if the current selections are contiguous', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = contiguousSelection;
      stateModel.shiftClick('uuidninth');
      expect(stateModel.getSelectedUuids()).toEqual([
        "uuideighth",
        "uuidfifth",
        "uuidninth",
        "uuidseventh",
        "uuidsixth"
      ]);
    });
    it('should set a block of selections below the current selections', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      stateModel.shiftClick('uuidfirst');
      expect(stateModel.getSelectedUuids()).toEqual([
        "uuideighth",
        "uuidfirst",
        "uuidsecond",
        "uuidsixth",
        "uuidthird"
      ]);
    });
    it('should set a block of selections above the current selections', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      stateModel.shiftClick('uuidtenth');
      expect(stateModel.getSelectedUuids()).toEqual([
        "uuideighth",
        "uuidninth",
        "uuidsixth",
        "uuidtenth",
        "uuidthird"
      ]);
    });
    it('should set a block of section based on the two existing selections ' +
      'that are around the new selection', () => {
      stateModel.updateRowOrder(sortedRows);
      stateModel.selectedRows = discreteSelections;
      stateModel.shiftClick('uuidfifth');
      expect(stateModel.getSelectedUuids()).toEqual([
        "uuideighth",
        "uuidfifth",
        "uuidfourth",
        "uuidsixth",
        "uuidthird"
      ]);
    });
  });
});
