import util from "util";
import {DateTime} from "luxon";
import {render, screen} from "@testing-library/react";
import React, {useState as useStateMock} from "react";
import userEvent from "@testing-library/user-event";

import {AuditUploadForm, initialAuditFormData} from "../AuditUploadForm";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}))

jest.mock('../../location/LocationAutoComplete', () => ({
  LocationAutoComplete: props => (<>
    <h2>Mock Location Auto Complete</h2>
    <h3>page is {props['page']}</h3>
    <h3>locationUuid is {props['null']}</h3>
    <h3>returnChosen is {props['returnChosen'] ? 'present' : 'absent'}</h3>
    <button onClick={() => props['returnChosen']({signature: {customer_code: 'I am a customer code'}})}>
      Mock Choose Location
    </button>
  </>),
}));
jest.mock('react-datepicker', () => ({
  __esModule: true,
  default: props => <>
    <h2>Mock Date Picker</h2>
    <h3>selected is {props['selected'] ? props['selected'].toString() : null}</h3>
    <h3>className is {props['className']}</h3>
    <h3>onChange is {props['onChange'] ? 'present' : 'absent'}</h3>
    <button onClick={() => {
      props['onChange']('07/11/2022')
    }}>
      Mock Choose Date
    </button>
  </>
}))

describe('AuditUploadForm', () => {
  let setLocationChosenMock, setFormMock, setAuditFormMock, stateMock, usStateCalls, testDate;
  const renderAuditUploadForm = () => {
    return render(
      <AuditUploadForm
        formSet={setAuditFormMock}
      />)
  }
  beforeEach(() => {
    setLocationChosenMock = jest.fn();
    setFormMock = jest.fn();
    setAuditFormMock = jest.fn();
    usStateCalls = 0;
    testDate = DateTime.fromObject({year:2022, month:5, day:23}).toJSDate();
    stateMock = (useStateMock as jest.Mock)
      .mockImplementationOnce(() => ([{...initialAuditFormData, scanDate: testDate}, setFormMock]))
      .mockImplementationOnce(() => ([false, setLocationChosenMock]))
      .mockImplementation(() => [{}, jest.fn()]);

  });
  afterEach(() => {
    console.log('clearing mocks');
    jest.clearAllMocks();
  });
  it('should set the scan date on the form', () => {
    userEvent.setup();
    renderAuditUploadForm();
    const button = screen.getByRole('button', {name: 'Mock Choose Date'});
    return userEvent.click(button)
      .then(() => {
        expect(setAuditFormMock).toBeCalled();
        expect(setFormMock).toBeCalled();
        expect(setFormMock.mock.calls).toMatchSnapshot();
        expect(setAuditFormMock.mock.calls).toMatchSnapshot();
      });
  });
  it('should set the scanner name on the form', () => {
    userEvent.setup();
    renderAuditUploadForm();
    const input = screen.getByRole('textbox');
    screen.debug(input);
    return userEvent.type(input, 'Mr. Scanner')
      .then(() => {
        expect(setAuditFormMock).toBeCalled();
        expect(setFormMock).toBeCalled();
        expect(setFormMock.mock.calls).toMatchSnapshot();
        expect(setAuditFormMock.mock.calls).toMatchSnapshot();
      });
  });
  it('should set location on the form', () => {
    userEvent.setup();
    renderAuditUploadForm();
    const button = screen.getByRole('button', {name: 'Mock Choose Location'});
    return userEvent.click(button)
      .then(() => {
        expect(setAuditFormMock).toBeCalled();
        expect(setFormMock).toBeCalled();
        expect(setFormMock.mock.calls).toMatchSnapshot();
        expect(setAuditFormMock.mock.calls).toMatchSnapshot();
      });
  });
});
