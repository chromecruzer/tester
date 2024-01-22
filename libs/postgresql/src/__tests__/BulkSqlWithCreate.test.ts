import {BulkSqlWithCreate} from "@trac/postgresql";

describe('BulkSqlWithCreate', () => {
  let mapping, client, bulkCreate;
  beforeEach(() => {
    client = {
      query: jest.fn().mockReturnValue(Promise.resolve())
    };
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
    bulkCreate = new BulkSqlWithCreate('schema name', 'table name', mapping, false);
  });
  describe('#createSchema', () => {
    it('should call with correct sql to create a schema', () => {
      bulkCreate.createSchema(client);
      expect(client.query.mock.calls[0][0]).toMatchSnapshot();
    });
  });
  describe('createTable', () => {
    it('should call with correct sql to create a table', () => {
      bulkCreate.createTable(client);
      expect(client.query.mock.calls[0][0]).toMatchSnapshot();
    });
  });
  describe('fill', () => {
    it('should call bulk fill with the correct parameters', () => {
      const data = [
        ['string', 57, new Date('10/10/2021')],
        ['another string', 65, new Date('10/11/2021')],
        ['also a string', 123, new Date('10/12/2021')],
      ];
      return bulkCreate.fill(data, client).then(() => {
        expect(client.query.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
  describe('delete', () => {
    it('should call with correct sql to delete data', () => {
      const uuids = ['1uuid', '2uuid', '3uuid', '4uuid', '5uuid'];
      bulkCreate.delete(uuids,client);
      expect(client.query.mock.calls[0][0]).toMatchSnapshot();
    });
  });
});
