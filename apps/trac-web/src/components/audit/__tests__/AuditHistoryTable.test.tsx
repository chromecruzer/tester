import {AuditHistory} from "../AuditHistory";
import {render, screen} from "@testing-library/react";
import * as reactRedux from "../../../redux/hooks";
import {AuditStatusType} from "@trac/datatypes";
import * as reactRouter from "react-router";
import {useState as useStateMock} from "react";
import userEvent from "@testing-library/user-event";

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn()
}))
describe('AuditHistoryTable', () => {
  let openAudits, closedAudits, dispatchSpy, navigateSpy, setAuditStatusSpy;
  const renderAuditHistoryTable = () => {
    render(<AuditHistory/>)
  }
  const setupSelector = (type = null as AuditStatusType) => {
    let expected;
    switch (type) {
      case 'OPEN':
        expected = openAudits;
        break;
      case 'CLOSED':
        expected = closedAudits;
        break;
      default:
        expected = [...openAudits, ...closedAudits];
        break;
    }
    jest.spyOn(reactRedux, 'useAppSelector').mockImplementation(() => ({
      audits: expected,
      type: 'locations'
    }));
  }
  beforeEach(() => {
    dispatchSpy = jest.fn();
    navigateSpy = jest.fn();
    setAuditStatusSpy = jest.fn();
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    jest.spyOn(reactRouter, 'useNavigate').mockImplementation(() => navigateSpy);
    (useStateMock as jest.Mock)
      .mockImplementation(() => ([null, setAuditStatusSpy]));
    openAudits = [
      {
        uuid: 'openuuid1',
        received_date: '07/11/2022',
        location_code: 'location1',
        location: 'Oh No I am under audit',
        scan_date: '06/01/2022',
        close_date: null,
        status: 'OPEN',
        auditor: 'Becky Counter',
        scanner: 'Mike Scanner'
      },
      {
        uuid: 'openuuid2',
        received_date: '07/03/2022',
        location_code: 'location13',
        location: 'I got nuttin to hide',
        scan_date: '05/23/2022',
        close_date: null,
        status: 'OPEN',
        auditor: 'Becky Counter',
        scanner: 'Bubba Scanner'
      },
    ]
    closedAudits = [
      {
        uuid: 'closeduuid3',
        received_date: '05/11/2021',
        location_code: 'location1',
        location: 'Oh No I am under audit',
        scan_date: '03/01/2021',
        close_date: '08/17/2021',
        status: 'CLOSED',
        auditor: 'Priscilla Counter',
        scanner: 'Mike Scanner'
      },
      {
        uuid: 'closeduuid4',
        received_date: '05/12/2021',
        location_code: 'location13',
        location: 'I got nuttin to hide',
        scan_date: '03/06/2021',
        close_date: '08/19/2021',
        status: 'CLOSED',
        auditor: 'Priscilla Counter',
        scanner: 'Bubba Scanner'
      },
      {
        uuid: 'closeduuid5',
        received_date: '05/10/2021',
        location_code: 'location2',
        location: 'My books are clean',
        scan_date: '02/14/2021',
        close_date: '06/17/2021',
        status: 'CLOSED',
        auditor: 'Priscilla Counter',
        scanner: 'Mary Lou Scanner'
      },
    ]
  });
  it('should display history data correctly', () => {
    setupSelector();
    renderAuditHistoryTable();
    const rows = screen.queryAllByRole('row');
    expect(rows).toMatchSnapshot();
  });
  it('should navigate to the audit uuid', () => {
    userEvent.setup();
    setupSelector();
    renderAuditHistoryTable();
    // screen.debug();
    const rows = screen.queryAllByRole('row');
    userEvent.click(rows[5]).then(() => { //TODO this is not triggering
      expect(navigateSpy.mock.calls).toMatchSnapshot();
    })
  });
  it('should filter OPEN items', () => {
    setupSelector('OPEN');
    renderAuditHistoryTable();
    const rows = screen.queryAllByRole('row');
    expect(rows).toMatchSnapshot();
  });
  it('should filter CLOSED items', () => {
    setupSelector('CLOSED');
    renderAuditHistoryTable();
    const rows = screen.queryAllByRole('row');
    expect(rows).toMatchSnapshot();
  });
});
