import {ImportIntoConsignments} from "@trac/postgresql";

describe('ImportIntoConsignments', () => {
  let importModule, mockClient, mockSearchTable;
  beforeEach(() => {
    mockClient = {
      query: jest.fn().mockReturnValue(Promise.resolve({ rows: ['result1', 'result2']}))
    };
     importModule = new ImportIntoConsignments('SchemaName', 'TableName', 'IOLTableName','ProductTableName');
    mockSearchTable  = {
      fillTable: jest.fn().mockReturnValue(Promise.resolve())
    }
    importModule.search = mockSearchTable
  });
  describe('into', () => {
    it('should create SQL to convert IOL records to consignments', () => {
      return importModule.into(['product1', 'product2', 'product3', 'product4'],mockClient)
        .then(() => {
          expect(mockClient.query.mock.calls[0][0]).toMatchSnapshot();
        });
    });
  });
  describe('addToSearch', () => {
    it('should call searchTable correctly to add consignment records to the search table', () => {
      return importModule.addToSearch(mockClient)
        .then(() => {
          expect(mockSearchTable.fillTable.mock.calls).toMatchSnapshot();
        });
    });
  });
});
