import {render, screen, within} from "@testing-library/react";
import * as reactRedux from "../../../redux/hooks";
import React from "react";
import {UploadDataAnalyticsTable} from "../UploadDataAnalyticsTable";
import * as reactRouter from "react-router";

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));
describe('UploadDataAnalyticsTable', () => {
  let expectedAnalytics, useParamsMock, dispatchSpy, useSelectorMock;
  const renderUploadDataAnalyticsTable = () => {
    render(<UploadDataAnalyticsTable/>)
  };
  beforeEach(() => {
    expectedAnalytics = {
      adds: 100,
      removes: 200,
      modifies: 50
    };
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    jest.spyOn(reactRedux, 'useAppSelector').mockImplementation(() => expectedAnalytics);
    useParamsMock = jest.spyOn(reactRouter, 'useParams');
    useParamsMock.mockImplementation(() => ({upload_filetype: 'iol_record', session: 'SESSION'}));
  });
  it('should have an analytics table', () => {
    renderUploadDataAnalyticsTable();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(4) // includes header row
    rows.forEach((r, i) => {
      const cells = within(r).queryAllByRole('cell');
      // screen.debug(r);
      switch(i) {
        case 0:
          return;
        case 1:
          expect(within(cells[0]).queryByText('adds')).not.toBeNull();
          expect(within(cells[1]).queryByText('100')).not.toBeNull();
          return;
        case 2:
          expect(within(cells[0]).queryByText('modifies')).not.toBeNull();
          expect(within(cells[1]).queryByText('50')).not.toBeNull();
          return;
        case 3:
          expect(within(cells[0]).queryByText('removes')).not.toBeNull();
          expect(within(cells[1]).queryByText('200')).not.toBeNull();
          return;
      }
    });
  });
});
