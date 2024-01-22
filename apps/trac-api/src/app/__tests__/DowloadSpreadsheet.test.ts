import UploadManager from "../datastore/UploadManager";
import {DownloadSpreadsheet} from "../DownloadSpreadsheet";

describe('DownloadSpreadsheet', () => {
  let columns, data, saveFileSpy, mockResponse, mockEnd, download;
  beforeEach(() => {
    saveFileSpy = jest.fn().mockImplementation(() => 'converted spreadsheet buffer');
    mockEnd = jest.fn();
    jest.spyOn(UploadManager, 'newToken').mockImplementation(() => 'newToken');
    mockResponse = {
      attachment: jest.fn(),
      status: jest.fn().mockImplementation(() => ({end: mockEnd})),
    }
    columns = [
      {
        Header: 'Text Column',
        accessor: 'textColumn'
      },
      {
        Header: 'Number Column',
        accessor: 'numberColumn'
      },
      {
        Header: 'Date Column',
        accessor: 'dateColumn'
      },
    ];
    data = [
      {
        textColumn: 'text1',
        numberColumn: 102,
        dateColumn: '10/02/21'
      },
      {
        textColumn: 'text2',
        numberColumn: 115,
        dateColumn: '10/02/21'
      },
      {
        textColumn: '3rd text',
        numberColumn: 10.2,
        dateColumn: '10/12/21'
      },
      {
        textColumn: 'text the fourth',
        numberColumn: 12345,
        dateColumn: '10/15/21'
      },
    ];
    download = new DownloadSpreadsheet();
    download.saveFile = saveFileSpy;
  });
  describe('convertToSpreadsheet', () => {
    it('should create a spreadsheet from headers and data', () => {
      const convert = download.convertToSpreadsheet();
      return convert({
        body: {
          headers: columns,
          spreadsheet: data,
        }
      }, mockResponse, jest.fn())
        .then(() => {
          expect(saveFileSpy.mock.calls).toMatchSnapshot();
          expect(mockResponse.attachment.mock.calls).toMatchSnapshot();
        });
    });
  });
});
