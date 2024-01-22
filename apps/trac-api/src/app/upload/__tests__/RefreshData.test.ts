import {ImportIntoConsignments, ImportIntoJumpTable, SearchTable} from '@trac/postgresql';
import RefreshData from "../RefreshData";
import util from "util";
import {StatusCodes} from "http-status-codes";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

jest.mock('@trac/postgresql');
describe('RefreshData', () => {
  let mockSearchTable, module, mockUploadManager, mockPostgresClient, mockResponse, client,
    mockImportIntoConsignments, mockImportIntoJumpTable;
  beforeEach(() => {
    client = 'I am a client';
    mockSearchTable = {
      removeTable: jest.fn(),
      createTable: jest.fn(),
      fillTable: jest.fn(),
    }
    mockUploadManager = {
      markRefresh: jest.fn(),
    }
    mockPostgresClient = {
      getClient: jest.fn().mockReturnValue(Promise.resolve(client)),
      release: jest.fn()
    }
    mockResponse = {
      status: jest.fn(),
      send: jest.fn(),
    }
    mockImportIntoConsignments = {
      removeTable: jest.fn(),
      into: jest.fn(),
    }
    mockImportIntoJumpTable = {
      removeTable: jest.fn(),
      fill: jest.fn(),
    }
    jest.mocked(SearchTable, true).mockReturnValue(mockSearchTable);
    jest.mocked(ImportIntoConsignments, true).mockReturnValue(mockImportIntoConsignments);
    jest.mocked(ImportIntoJumpTable, true).mockReturnValue(mockImportIntoJumpTable);
    module = new RefreshData('test schema', mockUploadManager);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('refresh', () => {
    it('should calls the search table functions correctly', () => {
      const func = module.refresh(mockPostgresClient);
      return func({body:{user: 'Gloria Titwillow'}}, mockResponse, jest.fn())
        .then(() => {
          // console.log('func completed');
          expect(mockSearchTable.removeTable).toBeCalledWith(client);
          expect(mockSearchTable.createTable).toBeCalledWith(client);
          expect(mockSearchTable.fillTable.mock.calls).toMatchSnapshot();
        })
    });
    it('should call import consignment functions correctly', () => {
      const func = module.refresh(mockPostgresClient);
      return func({body:{user: 'Gloria Titwillow'}}, mockResponse, jest.fn())
        .then(() => {
          // console.log('func completed');
          expect(mockImportIntoConsignments.removeTable).toBeCalledWith(client);
          expect(mockImportIntoConsignments.into).toBeCalledWith(['PREM_IOLS_TOT', 'STAND_IOLS_TOT'], client);
        })
    });
    it('should call import sales jump table functions correctly', () => {
      const func = module.refresh(mockPostgresClient);
      return func({body:{user: 'Gloria Titwillow'}}, mockResponse, jest.fn())
        .then(() => {
          // console.log('func completed');
          expect(mockImportIntoJumpTable.removeTable).toBeCalledWith(client);
          expect(mockImportIntoJumpTable.fill).toBeCalledWith(client);
        })
    });
    it('should mark the refresh with the upload manager', () => {
      const func = module.refresh(mockPostgresClient);
      return func({body:{user: 'Gloria Titwillow'}}, mockResponse, jest.fn())
        .then(() => {
          // console.log('func completed');
          expect(mockUploadManager.markRefresh).toBeCalledWith('Gloria Titwillow');
        })
    });
    it('should handle the postgresql client correctly', () => {
      const func = module.refresh(mockPostgresClient);
      return func({body:{user: 'Gloria Titwillow'}}, mockResponse, jest.fn())
        .then(() => {
          // console.log('func completed');
          expect(mockPostgresClient.getClient).toBeCalled();
          expect(mockPostgresClient.release).toBeCalledWith(client);
        })
    });
    it('should return the correct response', () => {
      const func = module.refresh(mockPostgresClient);
      return func({body:{user: 'Gloria Titwillow'}}, mockResponse, jest.fn())
        .then(() => {
          // console.log('func completed');
          expect(mockResponse.status).toBeCalledWith(StatusCodes.OK);
          expect(mockResponse.send).toBeCalledWith('OK');
        })
    });
  });
});
