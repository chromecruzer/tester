import * as reactRedux from "../../redux/hooks";
import * as reduxActions from '../../redux/uploadActions'
import History from "../History";
import {render, screen} from "@testing-library/react";
import React, {useContext as useContextMock, useState as useStateMock} from "react";
import userEvent from "@testing-library/user-event";

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
}))

jest.mock('../../components/upload/DataUploadHistoryTable', () => ({
  DataUploadHistoryTable: props => (<>
    <h4>Mock Data History Table</h4>
  </>),
}))

jest.mock('../../components/audit/AuditHistoryTable', () => {
  return {
    AuditHistoryTable: props => (<>
      <h4>Mock Audit History Table</h4>
    </>),
  }
})

describe('History', () => {
  let dispatchSpy, postRefreshMock, setHistoryTypeSpy, useSelectorMock, tracState, expectedUser;
  beforeEach(() => {
    expectedUser = 'Delila Twignut';
    tracState = {
      tracState: {
        appUser: expectedUser
      },
      setTracContext: jest.fn(),
    };
    (useContextMock as jest.Mock).mockReturnValue(tracState);
    dispatchSpy = jest.fn().mockReturnValue(Promise.resolve());
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    postRefreshMock = jest.spyOn(reduxActions, 'postRefresh')
    useSelectorMock = jest.spyOn(reactRedux, 'useAppSelector');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const setStates = (isAuditHistory = true) => {
    (useStateMock as jest.Mock).mockReturnValue([isAuditHistory ? 'Audit History' : 'Data Upload History',
      setHistoryTypeSpy]);
  }
  const setLoading = (loadingIsTrue = false) => {
    useSelectorMock.mockImplementation(() => loadingIsTrue)
  }
  const renderUploadHistory = () => {
    render(<History/>);
  }
  it('should display audit history correctly', () => {
    setStates();
    setLoading();
    renderUploadHistory();
    screen.getByText('Mock Audit History Table')
  });
  it('should display data history correctly', () => {
    setStates(false);
    setLoading();
    renderUploadHistory();
    screen.getByText('Mock Data History Table')
  });
  it('should dispatch a refresh correctly', () => {
    userEvent.setup();
    setStates(false);
    setLoading();
    renderUploadHistory();
    // screen.debug();
    const refresh = screen.getByRole('button');
    return userEvent.click(refresh)
      .then(() => {
        // console.log('click happened');
        expect(postRefreshMock).toBeCalledWith(expectedUser);
      });
  });
  it('should be aware of redux loading', () => {
    setStates(false);
    setLoading(true);
    renderUploadHistory();
    // screen.debug();
    const refresh = screen.getByRole('button');
    expect(refresh.className).toContain('button-disabled');
  });
});
