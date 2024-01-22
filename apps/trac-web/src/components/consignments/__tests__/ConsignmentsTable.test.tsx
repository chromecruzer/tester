import {DateTime} from "luxon";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import React, {useContext as useContextMock, useState as useStateMock} from "react";
import * as reactRedux from "../../../redux/hooks";
import {ConsignmentsTable} from "../ConsignmentsTable";
import {ExpirationCalculations} from "@trac/datatypes";

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
describe('ConsignmentsTable', () => {
  let consignments, startDate, inventory, mockSetTracContext, mockGroupConsignments, filters, mockSetFilters,
    mockDispatch, calculations, useSelectorMock;
  const renderConsignmentsTable = () => {
    render(<ConsignmentsTable/>)
  };
  const setupPageState = (exists = true) => {
    (useContextMock as jest.Mock).mockImplementation(() => ({
      tracState: {
        inventory: exists ? inventory : null
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
        expire_date: startDate.plus({month: 3}).toJSDate(),
      },
      {
        uuid: 'uuid2',
        description4: 'Excellent Products',
        item: 'item2',
        description: 'Exit Lense',
        lot: '0114313',
        expire_date: startDate.plus({month: 4}).toJSDate(),
      },
      {
        uuid: 'uuid3',
        description4: 'Superior Products',
        item: 'item3',
        description: 'Sup Lense',
        lot: '0114377',
        expire_date: startDate.plus({month: 5}).toJSDate(),
      },
      {
        uuid: 'uuid4',
        description4: 'Superior Products',
        item: 'item4',
        description: 'Super Lense',
        lot: '0124377',
        expire_date: startDate.plus({month: 6}).toJSDate(),
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
    };
    calculations = [
      {
        description4: 'Excellent Products',
        total: '120',
        tooLate: '5',
        lessThan30: '8',
        between30and60: '30',
        moreThan60: '77'
      },
      {
        description4: 'Superior Products',
        total: '200',
        tooLate: '10',
        lessThan30: '15',
        between30and60: '80',
        moreThan60: '95'
      },
    ];
    mockSetTracContext = jest.fn();
    mockDispatch = jest.fn();
    mockGroupConsignments = jest.spyOn(ExpirationCalculations.prototype, 'groupConsignments')
      .mockReturnValue(calculations);

    (useStateMock as jest.Mock)
      .mockImplementation(() => ([filters, mockSetFilters]));
    useSelectorMock = jest.spyOn(reactRedux, 'useAppSelector');
    jest.spyOn(reactRedux, 'useAppDispatch').mockReturnValue(mockDispatch);
  });

  it('should calculate the consignment analytics with the correct data and filters', () => {
    setupPageState();
    renderConsignmentsTable();
    expect(mockGroupConsignments).toBeCalledWith(consignments, filters);
  });
  it('should display the correct rows in the tables', () => {
    setupPageState();
    renderConsignmentsTable();
    screen.debug();
    screen.getByRole('table');
    screen.getByText('Excellent Products');
    let total = screen.getByText('120');
    expect(total).toHaveClass('text-center');
    let tooLate = screen.getByText('5');
    expect(tooLate).toHaveClass('text-center');
    let lessThan30 = screen.getByText('8');
    expect(lessThan30).toHaveClass('text-center');
    let between30and60 = screen.getByText('30');
    expect(between30and60).toHaveClass('text-center');
    let moreThan60 = screen.getByText('77');
    expect(moreThan60).toHaveClass('text-center');
    screen.getByText('Superior Products');
    total = screen.getByText('200');
    expect(total).toHaveClass('text-center');
    tooLate = screen.getByText('10');
    expect(tooLate).toHaveClass('text-center');
    lessThan30 = screen.getByText('15');
    expect(lessThan30).toHaveClass('text-center');
    between30and60 = screen.getByText('80');
    expect(between30and60).toHaveClass('text-center');
    moreThan60 = screen.getByText('95');
    expect(moreThan60).toHaveClass('text-center');
  });
  it('should return blanks when there are no consignments', () => {
    setupPageState(false);
    renderConsignmentsTable();
    const table = screen.queryByRole('table');
    expect(table).toBeNull();
  });
});
