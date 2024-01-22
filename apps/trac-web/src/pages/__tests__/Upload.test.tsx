import React from "react";
import DataUpload, {pagesMap} from "../DataUpload";
import * as reactRedux from "../../redux/hooks";
import * as reactRouter from "react-router";
import * as reduxActions from '../../redux/uploadActions'
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
jest.mock('../../components/Upload/UploadSubmit', () => ({
  UploadSubmit: props => (<>
    <h4>Mock Submit</h4>
  </>),
}))

jest.mock('../../components/Upload/UploadDetailsComponent', () => ({
  UploadComparisonsComponent: props => (<>
    <h4>Mock Comparisons</h4>
  </>),
}))

jest.mock('../../components/Upload/UploadAnalyticsComponent', () => ({
  UploadAnalyticsComponent: props => (<>
    <h4>Mock Analytics</h4>
  </>),
}))


describe('Upload', () => {
  let dispatchSpy, cancelReduxMock, commitReduxMock, navigateSpy, useParamsMock, useSelectorMock, activePageMock;
  beforeEach(() => {
    navigateSpy = jest.fn();
    dispatchSpy = jest.fn().mockReturnValue(Promise.resolve());
    useParamsMock = jest.spyOn(reactRouter, 'useParams');
    jest.spyOn(reactRouter, 'useNavigate').mockImplementation(() => navigateSpy);
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    commitReduxMock = jest.spyOn(reduxActions, 'postCommit')
    cancelReduxMock = jest.spyOn(reduxActions, 'postCancel')
    activePageMock = jest.spyOn(pagesMap, 'activePage');
    useSelectorMock = jest.spyOn(reactRedux, 'useAppSelector');
    useSelectorMock.mockImplementation(() => ({}));
  });
  const renderUploadPage = () => render(
    <reactRouter.MemoryRouter><DataUpload/></reactRouter.MemoryRouter>);
  it('should display an http error', () => {
    const expected = {error:'we have an error'};
    useParamsMock.mockImplementation(() => ({upload_filetype: 'iol_record', session: 'SESSION'}));
    useSelectorMock.mockImplementation(() => expected);
    renderUploadPage();
    screen.getByText(expected.error)
  });
  it('should have a button that does a cancel', async () => {
    useParamsMock.mockImplementation(() => ({upload_filetype: 'iol_record', session: 'SESSION'}));
    renderUploadPage();
    const button = screen.queryByRole('button', {name: 'Cancel'});
    if (button === null) {
      throw new Error('Cannot find cancel button');
    }
    return userEvent.click(button).then(() => {
      expect(cancelReduxMock.mock.calls).toMatchSnapshot();
    });
  });
  it('should have a button that should go to details', () => {
    useParamsMock.mockImplementation(() => ({upload_filetype: 'iol_record', session: 'SESSION'}));
    activePageMock.mockImplementation(() => 'Analytics');
    renderUploadPage();
    const button = screen.queryByRole('button', {name: 'Details'});
    if (button === null) {
      throw new Error('Cannot find details button');
    }
    return userEvent.click(button).then(() => {
      expect(navigateSpy.mock.calls).toMatchSnapshot();
    });
  });
  it('should have a button that does a commit', async () => {
    useParamsMock.mockImplementation(() => ({upload_filetype: 'iol_record', session: 'SESSION'}));
    renderUploadPage();
    const button = screen.queryByRole('button', {name: 'Commit'});
    if (button === null) {
      throw new Error('Cannot find commit button');
    }
    userEvent.click(button).then(() => {
      expect(commitReduxMock.mock.calls).toMatchSnapshot();
    });
  });
});
