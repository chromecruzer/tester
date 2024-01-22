import {DateTime} from "luxon";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import React, {useContext as useContextMock, useState as useStateMock} from "react";
import {ExpirationsTable} from "../ExpirationsTable";
import * as reactRedux from "../../../redux/hooks";
import {ExpirationCalculations, tracDateFormat} from "@trac/datatypes";
import _ from "lodash";

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn()
}))
jest.mock('../../../redux/consignmentActions', () => ({
  getConsignments: jest.fn(),
  clearConsignments: jest.fn(),
}));
jest.mock('../../search/RowButtonsState');
jest.mock('../../tables/DownloadButton');

describe('ExpirationsTable', () => {
  let consignments, startDate, inventory, mockSetTracContext, mockFilterRecords, filters, mockSetFilters,
    mockDispatch, useSelectorMock;
  const renderExpirationTable = () => {
    render(<ExpirationsTable/>)
  };
  const setupPageState= (exists = true) => {
    (useContextMock as jest.Mock).mockImplementation(() => ({
      tracState: {
        inventory: exists ? inventory : null,
        location: {customer_code: 'customer code'}
      },
      setTracContext: mockSetTracContext,
    }));
    useSelectorMock.mockImplementation(() => ({
        loading: false,
        consignments: exists ? consignments : [],
        error: ''
      }));
  }

  beforeEach(() => {
    startDate = DateTime.fromObject({year: 2021, month: 11, day: 15});
    consignments = [
      {
        uuid: 'uuid1',
        description4: 'Excellent Products',
        item: 'item1',
        description: 'Exo Lense',
        lot: '0112213',
        expire_date: startDate.plus({month: 3}).toFormat(tracDateFormat),
      },
      {
        uuid: 'uuid2',
        description4: 'Excellent Products',
        item: 'item2',
        description: 'Exit Lense',
        lot: '0114313',
        expire_date: startDate.plus({month: 4}).toFormat(tracDateFormat),
      },
      {
        uuid: 'uuid3',
        description4: 'Superior Products',
        item: 'item3',
        description: 'Sup Lense',
        lot: '0114377',
        expire_date: startDate.plus({month: 5}).toFormat(tracDateFormat),
      },
      {
        uuid: 'uuid4',
        description4: 'Superior Products',
        item: 'item4',
        description: 'Super Lense',
        lot: '0124377',
        expire_date: startDate.plus({month: 6}).toFormat(tracDateFormat),
      },
    ];
    inventory = {
      uuid: 'uuid1',
      name: 'Snidely Whiplash',
      customer_code: '007123',
      address: '333 Main Street',
      city: 'Metropolis',
      state: 'Xanadu',
      postal: '23334-0001'
    };
    filters = {
      premium: true,
      standard: false,
    }
    mockSetTracContext = jest.fn();
    mockDispatch = jest.fn();
    mockFilterRecords = jest.spyOn(ExpirationCalculations.prototype, 'filterRecords')
      .mockReturnValue(consignments);

    (useStateMock as jest.Mock)
      .mockImplementation(() => ([filters, mockSetFilters]));
    useSelectorMock = jest.spyOn(reactRedux, 'useAppSelector');
    jest.spyOn(reactRedux, 'useAppDispatch').mockReturnValue(mockDispatch);
  });
  it('should filter records correctly', () => {
    setupPageState();
    renderExpirationTable();
    expect(mockFilterRecords).toBeCalledWith(consignments, filters);
  });
  it('should format the expiration dates', () => {
    setupPageState();
    renderExpirationTable();
    screen.getByRole('table');
    screen.getByText('02/15/2022');
    screen.getByText('03/15/2022');
    screen.getByText('04/15/2022');
    screen.getByText('05/15/2022');
    // screen.debug();
  });
  it('should return blanks when there are no consignments', () => {
    setupPageState(false);
    renderExpirationTable();
    const table = screen.queryByRole('table');
    expect(table).toBeNull();
  });
  it('should use the correct style classes for headers', () => {
    setupPageState();
    renderExpirationTable();
    let date = screen.getByText('02/15/2022');
    expect(date).toHaveClass('text-center');
     date = screen.getByText('05/15/2022');
    expect(date).toHaveClass('text-center');

  });
});
