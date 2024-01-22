import * as reactRedux from "../../../redux/hooks";
import {render} from "@testing-library/react";
import React, {useContext as useContextMock} from "react";
import {LoadLocationIntoContext} from "../LoadLocationIntoContext";
import * as customerActions from '../../../redux/customerActions'
import {NullableString} from "@trac/datatypes";

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}))
describe('LoadLocationIntoContext', () => {
  let mockSetTracContext, location, mockDispatch, mockSelector, getCustomerMock;
  const renderLoadLocationIntoContext = () => {
    const component =
      <LoadLocationIntoContext
        locationCode='location code'
      />;
    return render(component)
  }
  const setupContext = (locationCode = null as NullableString) => {
    let location: ({[id: string]: NullableString} | null) = null;
        location = {customer_code: locationCode};
    (useContextMock as jest.Mock).mockImplementation(() => ({
      tracState: {location},
      setTracContext: mockSetTracContext,
    }));
  }
  beforeEach(() => {
    location = {
      uuid: 'uuid1',
      name: 'Snidely Whiplash',
      customer_code: '007123',
      address: '333 Main Street',
      city: 'Metropolis',
      state: 'Xanadu',
      postal: '23334-0001'
    };
    mockSetTracContext = jest.fn();
    mockDispatch = jest.fn();
    getCustomerMock = jest.spyOn(customerActions, 'getCustomers');
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => mockDispatch);
    mockSelector = jest.spyOn(reactRedux, 'useAppSelector');
  });
  afterEach(() => {
    getCustomerMock.mockClear();
  });
  it('should set the context with a location that has come in from redux', () => {
    mockSelector.mockReturnValue({location});
    setupContext();
    renderLoadLocationIntoContext();
    expect(mockSetTracContext).toBeCalledWith('location',location);
  });
  it('should dispatch a call to get a customer based on a customer id', () => {
    setupContext();
    renderLoadLocationIntoContext();
    expect(getCustomerMock).toBeCalledWith({customerId:'location code'});
  });
  it('should dispatch a call when context is mismatched with location code', () => {
    mockSelector.mockReturnValue({location});
    setupContext('another location code');
    renderLoadLocationIntoContext();
    expect(getCustomerMock).toBeCalledWith({customerId:'location code'});
  });
  it('should not dispatch anything if context is matched with the location code', () => {
    mockSelector.mockReturnValue({location});
    setupContext('location code');
    renderLoadLocationIntoContext();
    expect(getCustomerMock).not.toBeCalled();
  });
});
