import {render, screen, within} from "@testing-library/react";
import {DateTime} from "luxon";
import * as reactRedux from "../../../redux/hooks";
import {UploadDataDetailsTable} from "../UploadDataDetailsTable";
import * as reactRouter from "react-router";

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
describe('UploadDataDetailsTable', () => {
  let expectedAdds, expectedRemoves, expectedModifies, useSelectorMock, dispatchSpy, useParamsMock;
  const renderUploadComparisonsComponent = () => {
    render(<UploadDataDetailsTable/>)
  };
  beforeEach(() => {
    dispatchSpy = jest.fn().mockReturnValue(Promise.resolve());
    expectedAdds = [
      {
        uuid: 'uuid1',
        warehouse: 'wh1',
        location_code: 'lc1',
        name_code: 'nc1',
        address_phone: 'addr1',
        item: 'item1',
        description: 'I am 1 description',
        lot: 'lot1',
        quantity: 1,
        purchase_order: 'po1',
        received_date: '03/10/2021',
        expire_date: '03/10/2024',
        shipped_date: '02/28/2021',
      },
      {
        uuid: 'uuid2',
        warehouse: 'wh2',
        location_code: 'lc2',
        name_code: 'nc2',
        address_phone: 'addr2',
        item: 'item2',
        description: 'I am 2 description',
        lot: 'lot2',
        quantity: 2,
        purchase_order: 'po2',
        received_date: '03/21/2022',
        expire_date: '03/21/2024',
        shipped_date: '03/01/2022',
      },
      {
        uuid: 'uuid3',
        warehouse: 'wh3',
        location_code: 'lc3',
        name_code: 'nc3',
        address_phone: 'addr3',
        item: 'item3',
        description: 'I am 3 description',
        lot: 'lot3',
        quantity: 3,
        purchase_order: 'po3',
        received_date: '03/29/2013',
        expire_date: '03/30/2014',
        shipped_date: '03/02/2013',
      },
    ];
    expectedRemoves = [
      {
        uuid: 'uuid4',
        warehouse: 'wh4',
        location_code: 'lc4',
        name_code: 'nc4',
        address_phone: 'addr4',
        item: 'item4',
        description: 'I am 4 description',
        lot: 'lot4',
        quantity: 4,
        purchase_order: 'po4',
        received_date: '03/13/2014',
        expire_date: '03/23/2014',
        shipped_date: '03/03/2014',
      },
      {
        uuid: 'uuid5',
        warehouse: 'wh5',
        location_code: 'lc5',
        name_code: 'nc5',
        address_phone: 'addr5',
        item: 'item5',
        description: 'I am 5 description',
        lot: 'lot5',
        quantity: 5,
        purchase_order: 'po5',
        received_date: '03/14/2015',
        expire_date: '03/14/2017',
        shipped_date: '03/04/2015',
      },
    ];
    expectedModifies = [
      {
        original: {
          uuid: 'uuid6',
          warehouse: 'wh6',
          location_code: 'lc6',
          name_code: 'nc6',
          address_phone: 'addr6',
          item: 'item6',
          description: 'I am 6 description',
          lot: 'lot6',
          quantity: 6,
          purchase_order: 'po6',
          received_date: '03/25/2016',
          expire_date: '03/15/2014',
          shipped_date: '03/05/2016',
        },
        update: {
          uuid: 'uuid6',
          warehouse: 'wh6',
          location_code: 'lc6',
          name_code: 'nc6',
          address_phone: 'addr3',
          item: 'item6',
          description: 'I am 6 description',
          lot: 'lot6',
          quantity: 5,
          purchase_order: 'po6',
          received_date: '03/25/2016',
          expire_date: '04/15/2014',
          shipped_date: '03/05/2016',
        },
      },
      {
        original: {
          uuid: 'uuid7',
          warehouse: 'wh7',
          location_code: 'lc7',
          name_code: 'nc7',
          address_phone: 'addr7',
          item: 'item7',
          description: 'I am 7 description',
          lot: 'lot7',
          quantity: 7,
          purchase_order: 'po7',
          received_date: '03/16/2017',
          expire_date: '03/06/2014',
          shipped_date: '03/06/2017',
        },
        update: {
          uuid: 'uuid7',
          warehouse: 'wh17',
          location_code: 'lc7',
          name_code: 'nc7',
          address_phone: 'addr7',
          item: 'item7',
          description: 'I am 17 description',
          lot: 'lot7',
          quantity: 7,
          purchase_order: 'po17',
          received_date: '03/26/2017',
          expire_date: '04/16/2014',
          shipped_date: '03/06/2017',
        },
      },
    ];
    dispatchSpy = jest.fn();
    useParamsMock = jest.spyOn(reactRouter, 'useParams');
    useParamsMock.mockImplementation(() => ({upload_filetype: 'iol_report', session: 'SESSION'}));
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    useSelectorMock = jest.spyOn(reactRedux, 'useAppSelector');
  });
  afterEach(function () {
    jest.clearAllMocks();
  });
  it('should display comparison data with only removes', () => {
    useSelectorMock.mockImplementation(() => ({
      adds: [],
      removes: expectedRemoves,
      modifies: []
    }));
    renderUploadComparisonsComponent();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(3) // includes header row
    rows.forEach((r, i) => {
      // screen.debug(r);
      const cells = within(r).queryAllByRole('cell');
      switch (i) {
        case 0:
          return;
        case 1:
          expect(within(cells[0]).queryByText('Removed')).not.toBeNull();
          expect(within(cells[1]).queryByText('wh4')).not.toBeNull();
          expect(within(cells[2]).queryByText('lc4')).not.toBeNull();
          expect(within(cells[3]).queryByText('nc4')).not.toBeNull();
          expect(within(cells[4]).queryByText('addr4')).not.toBeNull();
          expect(within(cells[5]).queryByText('item4')).not.toBeNull();
          expect(within(cells[6]).queryByText('I am 4 description')).not.toBeNull();
          expect(within(cells[7]).queryByText('lot4')).not.toBeNull();
          expect(within(cells[8]).queryByText('4')).not.toBeNull();
          expect(within(cells[9]).queryByText('po4')).not.toBeNull();
          expect(within(cells[10]).queryByText('03/13/2014')).not.toBeNull();
          expect(within(cells[11]).queryByText('03/23/2014')).not.toBeNull();
          expect(within(cells[12]).queryByText('03/03/2014')).not.toBeNull();
          return;
        case 2:
          // screen.debug(r);
          expect(within(cells[0]).queryByText('Removed')).not.toBeNull();
          expect(within(cells[1]).queryByText('wh5')).not.toBeNull();
          expect(within(cells[2]).queryByText('lc5')).not.toBeNull();
          expect(within(cells[3]).queryByText('nc5')).not.toBeNull();
          expect(within(cells[4]).queryByText('addr5')).not.toBeNull();
          expect(within(cells[5]).queryByText('item5')).not.toBeNull();
          expect(within(cells[6]).queryByText('I am 5 description')).not.toBeNull();
          expect(within(cells[7]).queryByText('lot5')).not.toBeNull();
          expect(within(cells[8]).queryByText('5')).not.toBeNull();
          expect(within(cells[9]).queryByText('po5')).not.toBeNull();
          expect(within(cells[10]).queryByText('03/14/2015')).not.toBeNull();
          expect(within(cells[11]).queryByText('03/14/2017')).not.toBeNull();
          expect(within(cells[12]).queryByText('03/04/2015')).not.toBeNull();
          return;
      }
    });
  });
  it('should display comparison data with only adds', () => {
    useSelectorMock.mockImplementation(() => ({
      adds: expectedAdds,
      removes: [],
      modifies: []
    }));
    renderUploadComparisonsComponent();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(4) // includes header row
    rows.forEach((r, i) => {
      const cells = within(r).queryAllByRole('cell');
      switch (i) {
        case 0:
          return;
        case 1:
          // screen.debug(r);
          expect(within(cells[0]).queryByText('Added')).not.toBeNull();
          expect(within(cells[1]).queryByText('wh1')).not.toBeNull();
          expect(within(cells[2]).queryByText('lc1')).not.toBeNull();
          expect(within(cells[3]).queryByText('nc1')).not.toBeNull();
          expect(within(cells[4]).queryByText('addr1')).not.toBeNull();
          expect(within(cells[5]).queryByText('item1')).not.toBeNull();
          expect(within(cells[6]).queryByText('I am 1 description')).not.toBeNull();
          expect(within(cells[7]).queryByText('lot1')).not.toBeNull();
          expect(within(cells[8]).queryByText('1')).not.toBeNull();
          expect(within(cells[9]).queryByText('po1')).not.toBeNull();
          expect(within(cells[10]).queryByText('03/10/2021')).not.toBeNull();
          expect(within(cells[11]).queryByText('03/10/2024')).not.toBeNull();
          expect(within(cells[12]).queryByText('02/28/2021')).not.toBeNull();
          return;
        case 2:
          // screen.debug(r);
          expect(within(cells[0]).queryByText('Added')).not.toBeNull();
          expect(within(cells[1]).queryByText('wh2')).not.toBeNull();
          expect(within(cells[2]).queryByText('lc2')).not.toBeNull();
          expect(within(cells[3]).queryByText('nc2')).not.toBeNull();
          expect(within(cells[4]).queryByText('addr2')).not.toBeNull();
          expect(within(cells[5]).queryByText('item2')).not.toBeNull();
          expect(within(cells[6]).queryByText('I am 2 description')).not.toBeNull();
          expect(within(cells[7]).queryByText('lot2')).not.toBeNull();
          expect(within(cells[8]).queryByText('2')).not.toBeNull();
          expect(within(cells[9]).queryByText('po2')).not.toBeNull();
          expect(within(cells[10]).queryByText('03/21/2022')).not.toBeNull();
          expect(within(cells[11]).queryByText('03/21/2024')).not.toBeNull();
          expect(within(cells[12]).queryByText('03/01/2022')).not.toBeNull();
          return;
        case 3:
          // screen.debug(r);
          expect(within(cells[0]).queryByText('Added')).not.toBeNull();
          expect(within(cells[1]).queryByText('wh3')).not.toBeNull();
          expect(within(cells[2]).queryByText('lc3')).not.toBeNull();
          expect(within(cells[3]).queryByText('nc3')).not.toBeNull();
          expect(within(cells[4]).queryByText('addr3')).not.toBeNull();
          expect(within(cells[5]).queryByText('item3')).not.toBeNull();
          expect(within(cells[6]).queryByText('I am 3 description')).not.toBeNull();
          expect(within(cells[7]).queryByText('lot3')).not.toBeNull();
          expect(within(cells[8]).queryByText('3')).not.toBeNull();
          expect(within(cells[9]).queryByText('po3')).not.toBeNull();
          expect(within(cells[10]).queryByText('03/29/2013')).not.toBeNull();
          expect(within(cells[11]).queryByText('03/30/2014')).not.toBeNull();
          expect(within(cells[12]).queryByText('03/02/2013')).not.toBeNull();
          return;
      }
    });
  });
  it('should display comparison data with only modifies', () => {
    useSelectorMock.mockImplementation(() => ({
      adds: [],
      removes: [],
      modifies: expectedModifies
    }));
    renderUploadComparisonsComponent();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(3) // includes header row
    rows.forEach((r, i) => {
      const cells = within(r).queryAllByRole('cell');
      switch (i) {
        case 0:
          return;
        case 1:
          expect(within(cells[0]).queryByText('Modified')).not.toBeNull();
          expect(within(cells[1]).queryByText('wh6')).not.toBeNull();
          expect(within(cells[2]).queryByText('lc6')).not.toBeNull();
          expect(within(cells[3]).queryByText('nc6')).not.toBeNull();
          expect(within(cells[4]).queryByText('addr3')).not.toBeNull();//TT
          expect(within(cells[4]).queryByText('"addr6" changed to "addr3"')).not.toBeNull();
          expect(within(cells[5]).queryByText('item6')).not.toBeNull();
          expect(within(cells[6]).queryByText('I am 6 description')).not.toBeNull();
          expect(within(cells[7]).queryByText('lot6')).not.toBeNull();
          expect(within(cells[8]).queryByText('5')).not.toBeNull();//TT
          expect(within(cells[8]).queryByText('"6" changed to "5"')).not.toBeNull();
          expect(within(cells[9]).queryByText('po6')).not.toBeNull();
          expect(within(cells[10]).queryByText('03/25/2016')).not.toBeNull();
          expect(within(cells[11]).queryByText('04/15/2014')).not.toBeNull(); //TT
          expect(within(cells[11]).queryByText('"03/15/2014" changed to "04/15/2014"')).not.toBeNull();
          expect(within(cells[12]).queryByText('03/05/2016')).not.toBeNull();
          return;
        case 2:
          // screen.debug(r);
          expect(within(cells[0]).queryByText('Modified')).not.toBeNull();
          expect(within(cells[1]).queryByText('wh17')).not.toBeNull();//tt
          expect(within(cells[1]).queryByText('"wh7" changed to "wh17"')).not.toBeNull();
          expect(within(cells[2]).queryByText('lc7')).not.toBeNull();
          expect(within(cells[3]).queryByText('nc7')).not.toBeNull();
          expect(within(cells[4]).queryByText('addr7')).not.toBeNull();
          expect(within(cells[5]).queryByText('item7')).not.toBeNull();
          expect(within(cells[6]).queryByText('I am 17 description')).not.toBeNull();//tt
          expect(within(cells[6]).queryByText('"I am 7 description" changed to "I am 17 description"')).not.toBeNull();
          expect(within(cells[7]).queryByText('lot7')).not.toBeNull();
          expect(within(cells[8]).queryByText('7')).not.toBeNull();
          expect(within(cells[9]).queryByText('po17')).not.toBeNull();//tt
          expect(within(cells[9]).queryByText('"po7" changed to "po17"')).not.toBeNull();
          expect(within(cells[10]).queryByText('03/26/2017')).not.toBeNull();
          expect(within(cells[11]).queryByText('04/16/2014')).not.toBeNull();
          expect(within(cells[12]).queryByText('03/06/2017')).not.toBeNull();
          return;
      }
    });
  });
});
