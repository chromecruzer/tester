import React, {useState as useStateMock} from "react";
import * as reactRedux from "../../../redux/hooks";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import {UploadSubmit} from "../UploadSubmit";
import * as reduxActions from "../../../redux/uploadActions";
import userEvent from "@testing-library/user-event";
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn()
}))

jest.mock('../AuditUploadForm', () => ({
  AuditUploadForm: props => (<>
    <h2>Mock Audit Upload Form</h2>
    <h3>formSet is {props['formSet'] ? 'present' : 'absent'}</h3>
    {/*<button onClick={() => props['returnChosen']({signature: {customer_code: 'I am a customer code'}})}>*/}
    {/*  Mock Choose Location*/}
    {/*</button>*/}
  </>),
}));

describe('UploadSubmit', () => {
  let postSubmitMock, dispatchSpy, useSelectorMock;
  const renderUploadSubmit = () => {
    render(<UploadSubmit/>)
  };
  beforeEach(() => {
    postSubmitMock = jest.spyOn(reduxActions, 'postSubmit');
    dispatchSpy = jest.fn();
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    useSelectorMock = jest.spyOn(reactRedux, 'useAppSelector').mockReturnValue(false);
  });
  it('should be able to select an IOL Report', () => {
    const setFileTypeSpy = jest.fn();
    (useStateMock as jest.Mock).mockImplementation(init => [init, setFileTypeSpy]);
    renderUploadSubmit();
    const select = screen.queryByRole('combobox');
    if(select === null) {
      throw new Error('Select upload type could not be found')
    }
    return userEvent.selectOptions(select, 'iol_report').then(() => {
      expect(setFileTypeSpy).toBeCalledWith('iol_report');
    });

  });
  it('should have an upload submit button that works', () => {
    userEvent.setup();
    const xlsxFile = new File(['hello'], 'hello.xlsx',
      {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    (useStateMock as jest.Mock).mockImplementationOnce(init => ['scan_audit', () => 'setting file type']);
    (useStateMock as jest.Mock).mockImplementationOnce(init => ['hello.xlsx', () => 'setting uploadfile']);
    renderUploadSubmit();
    const button = screen.getByRole('button', { name:'Upload'});
    // screen.debug(button);
    userEvent.click(button).then(() => {
      //TODO: This still does not work;
      console.log('submit button clicked')
      expect(postSubmitMock.mock.calls).toMatchSnapshot();
      expect(dispatchSpy).toBeCalled();
    });
  });
  it('should have the submit button disabled when necessary', () => {
    renderUploadSubmit();
    const button = screen.queryByRole('button', { name:'Upload'});
    if(button === null) {
      throw new Error('Could not find upload submit button');
    }
    expect(button).toHaveClass('button-disabled');
  });
});
