import {render, screen} from "@testing-library/react";
import {AuditLocation} from "../AuditLocation";

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}))
describe('AuditLocation', () => {
  let customer, audit, salesrep;
  const renderAuditLocation = (audit, customer, salesrep) => {
    render(<AuditLocation
      auditSummary={({audit, customer, salesrep})}
    />)
  }
  beforeEach(() => {
    customer = {
      uuid: 'location uuid',
      name: 'Snidely Whiplash',
      customer_code: '007123',
      address: '333 Main Street',
      city: 'Metropolis',
      state: 'Xanadu',
      postal: '23334-0001'
    };
    salesrep = {
      first_name: 'Bobby',
      last_name: 'Bolivia',
      role: 'PDM',
    }
    audit = {
      uuid: 'audit uuid',
      received_date: '04/15/2022',
      location_code: 'location uuid',
      scan_date: '04/05/2022',
      close_date: null,
      status: 'Open',
      auditor: 'Ebenezer Scrooge',
      scanner: 'Commander Jordi'
    }
  });
  afterEach(function () {
    jest.clearAllMocks();
  });
  it('should display data without sales rep or customer', () => {
    renderAuditLocation(audit, null, null);
    screen.getByText('04/15/2022');
    screen.getByText('Open');
    screen.getByText('location uuid');
    screen.getByText('04/05/2022');
    screen.getByText('Ebenezer Scrooge');
    screen.getByText('Commander Jordi');

    expect(screen.queryByText('Snidely Whiplash')).toBeNull();
    expect(screen.queryByText('333 Main Street')).toBeNull();
    expect(screen.queryByText('Metropolis')).toBeNull();
    expect(screen.queryByText('Xanadu')).toBeNull();
    expect(screen.queryByText('23334-0001')).toBeNull();

    expect(screen.queryByText('Bobby')).toBeNull();
    expect(screen.queryByText('Bolivia')).toBeNull();
    expect(screen.queryByText('PDM')).toBeNull();
  });
  it('should display data without sales rep', () => {
    renderAuditLocation(audit, customer, null);
    screen.getByText('04/15/2022');
    screen.getByText('Open');
    screen.getByText('location uuid');
    screen.getByText('04/05/2022');
    screen.getByText('Ebenezer Scrooge');
    screen.getByText('Commander Jordi');

    screen.getByText('Snidely Whiplash');
    screen.getByText('333 Main Street');
    screen.getByText('Metropolis');
    screen.getByText('Xanadu');
    screen.getByText('23334-0001');

    expect(screen.queryByText('Bobby')).toBeNull();
    expect(screen.queryByText('Bolivia')).toBeNull();
    expect(screen.queryByText('PDM')).toBeNull();

  });
  it('should display all of the data', () => {
    renderAuditLocation(audit, customer, salesrep);
    screen.getByText('04/15/2022');
    screen.getByText('Open');
    screen.getByText('location uuid');
    screen.getByText('04/05/2022');
    screen.getByText('Ebenezer Scrooge');
    screen.getByText('Commander Jordi');

    screen.getByText('Snidely Whiplash');
    screen.getByText('333 Main Street');
    screen.getByText('Metropolis');
    screen.getByText('Xanadu');
    screen.getByText('23334-0001');

    screen.getByText('Bobby Bolivia');
    screen.getByText('Practice Development Manager (PDM)');
  });
});
