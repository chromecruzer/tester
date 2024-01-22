import * as reactRouter from "react-router";
import * as reactRedux from "../../../redux/hooks";
import {render, screen, within} from "@testing-library/react";
import {AuditScanUploadTable} from "../AuditScanUploadTable";
import _ from "lodash";
import React from "react";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));
describe('UploadAuditScanAnalyticsTable', () => {
  let expectedAnalytics, useParamsMock;
  const renderUploadAuditScanAnalyticsTable = () => {
    render(<AuditScanUploadTable/>)
  };
  beforeEach(() => {
    expectedAnalytics = {
      matches: 100,
      moved: 200,
      expired: 50,
      nomatches: 10,
      missing: 20,
    };
    jest.spyOn(reactRedux, 'useAppSelector').mockImplementation(() => expectedAnalytics);
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => jest.fn());
    useParamsMock = jest.spyOn(reactRouter, 'useParams');
    useParamsMock.mockImplementation(() => ({upload_filetype: 'audit_scan', session: 'SESSION'}));
  });
  afterEach(function () {
    jest.clearAllMocks();
  });
  it('should have an analytics table', () => {
    renderUploadAuditScanAnalyticsTable();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(6) // includes header row
    rows.forEach((r, i) => {
      const cells = within(r).queryAllByRole('cell');
      // screen.debug(r);
      switch (i) {
        case 0:
          return;
        case 1:
          expect(within(cells[0]).queryByText('matches')).not.toBeNull();
          expect(within(cells[1]).queryByText('100')).not.toBeNull();
          return;
        case 2:
          expect(within(cells[0]).queryByText('moved')).not.toBeNull();
          expect(within(cells[1]).queryByText('200')).not.toBeNull();
          return;
        case 3:
          expect(within(cells[0]).queryByText('not matched')).not.toBeNull();
          expect(within(cells[1]).queryByText('10')).not.toBeNull();
          return;
        case 4:
          expect(within(cells[0]).queryByText('missing')).not.toBeNull();
          expect(within(cells[1]).queryByText('20')).not.toBeNull();
          return;
        case 5:
          expect(within(cells[0]).queryByText('expired')).not.toBeNull();
          expect(within(cells[1]).queryByText('50')).not.toBeNull();
          return;
      }
    });
  });
});
