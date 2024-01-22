import IolBulkCommit from "../IolBulkCommit";
import UploadStoreManagement from "../../datastore/UploadStoreManagement";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

jest.mock('../../datastore/UploadStoreManagement');
const comparisons = {
  adds: [
    {
      uuid: 'uuid1',
      warehouse: 'CLR34',
      location_code: 'LOC1',
      name_code: 'nameCode1',
      address_phone: '123 White House Lane 888-112-1234',
      item: 'item1',
      description: 'I describe an item1',
      lot: 'lot1223',
      quantity: 1,
      purchase_order: 'purchased for dimplewig as item1',
      received_date: new Date('10/10/2021'),
      expire_date: new Date('10/10/2024'),
      shipped_date: new Date('10/07/2021'),
    },
    {
      uuid: 'uuid2',
      warehouse: 'CLR34',
      location_code: 'LOC1',
      name_code: 'nameCode2',
      address_phone: '123 Black House Lane 888-112-1234',
      item: 'item2',
      description: 'I describe an item2',
      lot: 'lot1225',
      quantity: 1,
      purchase_order: 'purchased for dimplewig as item1',
      received_date: new Date('12/10/2021'),
      expire_date: new Date('01/10/2024'),
      shipped_date: new Date('12/07/2021'),
    }
  ],
  removedUuids: ['uuid3', 'uuid4'],
  modifies: [
    {
      originalUuid: 'uuid5',
      new: {
        uuid: 'uuid5',
        warehouse: 'CLR34',
        location_code: 'LOC1',
        name_code: 'nameCode5',
        address_phone: '123 Vatican Alley 888-112-1234',
        item: 'item5',
        description: 'I describe an item5',
        lot: 'lot1445',
        quantity: 1,
        purchase_order: 'purchased for the congregation',
        received_date: new Date('01/10/2021'),
        expire_date: new Date('02/10/2024'),
        shipped_date: new Date('01/07/2021'),
      },
    },
    {
      originalUuid: 'uuid6',
      new: {
        uuid: 'uuid6',
        warehouse: 'CLR34',
        location_code: 'LOC1',
        name_code: 'nameCode6',
        address_phone: '123 SoCal Alley 888-112-1234',
        item: 'item7',
        description: 'I describe an item7',
        lot: 'lot1645',
        quantity: 1,
        purchase_order: 'purchased for the public',
        received_date: new Date('02/10/2021'),
        expire_date: new Date('03/10/2024'),
        shipped_date: new Date('02/07/2021'),
      },
    },
  ],
}
describe('IolBulkCommits', () => {
  describe('#commit', () => {
    //TODO: Some kind of bug ignores the mocked version of fill.
    xit('should call bulk fill and delete with the proper arguments', () => {
      const dataStore = new UploadStoreManagement('config');
      const mockRetrieve = jest.spyOn(dataStore, 'retrieve').mockReturnValue(Promise.resolve(comparisons));
      const bulkCommits = new IolBulkCommit(dataStore, 'schema name', 'table name');
      const mockDelete = jest.spyOn(bulkCommits.bulkForNew, 'delete').mockReturnValue(Promise.resolve());
      const mockFill = jest.spyOn(bulkCommits.bulkForNew, 'fill');
      console.log(`bulk fill ${dump(bulkCommits.bulkForNew.fill)}`);
      return bulkCommits.commit(comparisons, 'client').then(() => {
        // console.log('evaluating commit call');
        expect(mockDelete.mock.calls[0][0]).toEqual(['uuid3', 'uuid4', 'uuid5', 'uuid6']);
        expect(mockDelete.mock.calls[0][1]).toEqual('client');
        expect(mockFill.mock.calls[0][1]).toEqual('client');
        expect(mockFill.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
});
