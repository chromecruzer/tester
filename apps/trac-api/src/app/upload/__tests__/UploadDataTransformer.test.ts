import {v4 as uuidv4Mock} from 'uuid';
import * as util from "util";
import {UploadDataTransformer} from "../UploadDataTransformer";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
describe('UploadDataTransformer', () => {
  let clientMock, transformer, originals, updated, mockStoreFactory;
  beforeEach(() => {
    (uuidv4Mock as jest.Mock).mockImplementation(() => 'created uuid');
    clientMock = {
      query: jest.fn(),
    };
    mockStoreFactory = {
      create: jest.fn()
    }
    clientMock.query.mockImplementation(() => Promise.resolve());
    transformer = new UploadDataTransformer(mockStoreFactory, 'schema-name', 'iol');
    originals = [
      {
        uuid: 'same',
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
        uuid: 'modified',
        warehouse: 'CLR34',
        location_code: 'LOC1',
        name_code: 'nameCode1',
        address_phone: '333 Easter Bunny Lane 888-112-1234',
        item: 'item1',
        description: 'I describe an item1',
        lot: 'lot1225',
        quantity: 1,
        purchase_order: 'purchased for dimplewig as item1',
        received_date: new Date('10/10/2021'),
        expire_date: new Date('10/10/2024'),
        shipped_date: new Date('10/07/2021'),
      },
      {
        uuid: 'removed',
        warehouse: 'CLR22',
        location_code: 'LOC2',
        name_code: 'nameCode1',
        address_phone: '200 Mickey Mouse Road 888-112-1234',
        item: 'mouse',
        description: 'I describe a mouse',
        lot: 'lot1226',
        quantity: 1,
        purchase_order: 'purchased for the old lady a mouse',
        received_date: new Date('10/10/2021'),
        expire_date: new Date('10/10/2024'),
        shipped_date: new Date('10/07/2021'),
      },
    ];
    updated = [
      [
        'CLR34',
        'LOC1',
        'nameCode1',
        '123 White House Lane 888-112-1234',
        'item1',
        'I describe an item1',
        'lot1223',
        1,
        'purchased for dimplewig as item1',
        new Date('10/10/2021'),
        new Date('10/10/2024'),
        new Date('10/07/2021'),
      ],
      [
        'CLR34',
        'LOC1',
        'nameCode1',
        '333 Jack Frost Lane 888-112-1234',
        'item1',
        'I describe an item1',
        'lot1225',
        1,
        'purchased for dimplewig as item1',
        new Date('10/10/2021'),
        new Date('10/10/2024'),
        new Date('10/07/2021'),
      ],
      [
        'CLR22',
        'LOC2',
        'nameCode1',
        '200 Donald Duck Street 888-112-1234',
        'duck',
        'I describe a duck',
        'lot1227',
        1,
        'purchased for the old wolf a duck',
        new Date('10/10/2021'),
        new Date('10/10/2024'),
        new Date('10/07/2021'),
      ],
    ];
  });
  describe('#transform', () => {
    it('should return correct groupings of records', () => {
      clientMock.query.mockReturnValueOnce(Promise.resolve({rows: originals}))
        .mockReturnValueOnce(Promise.resolve({rows: [{uuid: 'removed'}]}));
      return transformer.transform(updated, clientMock, 'session-token')
        .then(() => {
          expect(mockStoreFactory.create.mock.calls).toMatchSnapshot();
        });
    });
  });
});
