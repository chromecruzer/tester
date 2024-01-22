import {LoadXlsxData} from "@trac/postgresql";
import {Settings} from "luxon";
import _ from "lodash";

describe('LoadXlsData', () => {
  let fs, xlsx, loader;
  beforeEach(() => {
    fs = {
      readFile: jest.fn(),
    };
    xlsx = {
      read: jest.fn(),
    }
    loader = new LoadXlsxData();
    loader.fs = fs;
    loader.xlsx = xlsx;
  });
  describe('readWithMap', () => {
    let sheets, mapping;
    beforeEach(() => {
      Settings.defaultZone = 'Central Time'
      mapping = [
        {
          xlsxAddress: 'A',
          dataType: 'string',
          sqlLabel: 'sqlLabelString',
          sqlType: 'char(5)'
        },
        {
          xlsxAddress: 'B',
          dataType: 'number',
          sqlLabel: 'sqlLabelNumber',
          sqlType: 'integer'
        },
        {
          xlsxAddress: 'C',
          dataType: 'date',
          sqlLabel: 'sqlLabelDate',
          sqlType: 'date'
        }
      ];
      sheets = {
        SheetNames: ['IOL'],
        Sheets: {
          'IOL': {
            'A1': {
              w: 'Should not be in snapshot',
            },
            'B1': {
              w: 'Should not be in snapshot',
            },
            'C1': {
              w: 'Should not be in snapshot',
            },
            'A2': {
              w: 'I am a string',
            },
            'B2': {
              w: 57,
            },
            'C2': {
              w: '10/10/2021',
            },
            'A3': {
              w: 'I am also a string',
            },
            'B3': {
              w: 123,
            },
            'C3': {
              w: '10/11/2021',
            },
            'A4': {
              w: 'I am still a string',
            },
            'B4': {
              w: 2001,
            },
            'C4': {
              w: '12/10/2021',
            },
          }
        }
      };
    });
    afterEach(() => {
      Settings.defaultZone = 'system'
    });
    it('should return an error if the XLSX file does not exist', () => {
      const expected = new Error('file does not exist');
      fs.readFile.mockImplementation(() => Promise.reject(expected));
      xlsx.read.mockReturnValue(sheets);
      return expect(loader.readWithMap('I am not a path', mapping)).rejects.toMatchSnapshot();
    });
    it('should return an error if the XLSX file does not parse', () => {
      const expected = new Error('XLSX is giving up');
      fs.readFile.mockImplementation(() => Promise.resolve('I am a buffer'));
      xlsx.read.mockImplementation(() => {
        throw expected;
      });
      return expect(loader.readWithMap('I am a bad file', mapping)).rejects.toEqual(expected);
    });
    it('should handle parsing of strings, dates, and numbers', () => {
      fs.readFile.mockImplementation(() => Promise.resolve('I am a buffer'));
      xlsx.read.mockReturnValue(sheets);
      return loader.readWithMap('I am a real xlsx file', mapping).then(() => {
        // console.log('checking bulk data');
        expect(loader.bulkData).toMatchSnapshot();
      })
    });
  });
  describe('scanForLotNumbers', () => {
    const createAuditScan = (includeHeader) => {
      const sheets = {
        SheetNames: ['Sheet1'],
        Sheets: {
          'Sheet1': null,
        }
      };
      const dataCells = {
        'A1': {
          w: '01234567',
          v: 1234567,
          t: 'n'
        },
        'B1': {
          w: 'Text',
          v: 'Text',
          t: 's'
        },
        'C1': {
          w: 'true',
          v: true,
          t: 'b'
        },
        'D1': {
          w: '10/10/2021',
          t: 'd'
        },
        'A2': {
          w: '08901234',
          v: 8901234,
          t: 'n'
        },
        'A3': {
          w: '08901235',
          v: '08901235',
          t: 's'
        },
        'B3': {
          w: 'Number as text',
          v: 'Number as text',
          t: 's'
        },
      };
      if (includeHeader) {
        const headerCells = {
          'A1': {
            w: 'S/N',
            v: 'S/N',
            t: 's'
          },
          'B1': {
            w: 'Text',
            v: 'Text',
            t: 's'
          },
          'C1': {
            w: 'Boolean',
            v: 'Boolean',
            t: 's'
          },
          'D1': {
            w: 'Date',
            v: 'Date',
            t: 's'
          },
        };
        const cellRegex = /([A-Z])(\d+)/;
        sheets.Sheets['Sheet1'] = _.reduce(dataCells, (accum, val, cellA) => {
          const [cell, col, row] = cellRegex.exec(cellA)
          // console.log(`cell ${cell} row ${row} col ${col}`);
          const fixed = Number(col) + 1;
          accum[`${col}${row}`] = val;
          return accum
        }, headerCells);
        return sheets;
      }
      sheets.Sheets['Sheet1'] = dataCells;
      return sheets;
    }
    it('should scan one column no headers', () => {
      const sheets = createAuditScan(false);
      fs.readFile.mockImplementation(() => Promise.resolve('I am a buffer'));
      xlsx.read.mockReturnValue(sheets);
      return loader.scanForLotNumbers('path/to/xlsx/file.xlsx')
        .then(() => {
          expect(loader.lotNumbers).toMatchSnapshot();
        });
    });
    it('should ignore text rows', () => {
      const sheets = createAuditScan(true);
      fs.readFile.mockImplementation(() => Promise.resolve('I am a buffer'));
      xlsx.read.mockReturnValue(sheets);
      return loader.scanForLotNumbers('path/to/xlsx/file.xlsx')
        .then(() => {
          expect(loader.lotNumbers).toMatchSnapshot();
        });
    });
  });
});
