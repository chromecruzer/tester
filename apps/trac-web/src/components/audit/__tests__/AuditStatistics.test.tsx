import {render, screen} from "@testing-library/react";
import {AuditStatistics} from "../AuditStatistics";

describe('AuditStatistics', () => {
  let items;
  const renderAuditStatistics = () => {
    render(<AuditStatistics audit={{items}}/>);
  }
  beforeEach(() => {
    items = [
      {
        uuid: 'true match 1',
        audit_match: 'True Match'
      },
      {
        uuid: 'true match 7',
        audit_match: 'True Match'
      },
      {
        uuid: 'true match 8',
        audit_match: 'True Match'
      },
      {
        uuid: 'true match 2',
        audit_match: 'True Match'
      },
      {
        uuid: 'true match 3',
        audit_match: 'True Match'
      },
      {
        uuid: 'true match 4',
        audit_match: 'True Match'
      },
      {
        uuid: 'true match 5',
        audit_match: 'True Match'
      },
      {
        uuid: 'true match 6',
        audit_match: 'True Match'
      },
      {
        uuid: 'billed 1',
        audit_match: 'Billed'
      },
      {
        uuid: 'billed 2',
        audit_match: 'Billed'
      },
      {
        uuid: 'billed 3',
        audit_match: 'Billed'
      },
      {
        uuid: 'billed 4',
        audit_match: 'Billed'
      },
      {
        uuid: 'billed 5',
        audit_match: 'Billed'
      },
      {
        uuid: 'billed 6',
        audit_match: 'Billed'
      },
      {
        uuid: 'billed 7',
        audit_match: 'Billed'
      },
      {
        uuid: 'found elsewhere 1',
        audit_match: 'Found In Other Location'
      },
      {
        uuid: 'found elsewhere 2',
        audit_match: 'Found In Other Location'
      },
      {
        uuid: 'found elsewhere 3',
        audit_match: 'Found In Other Location'
      },
      {
        uuid: 'found elsewhere 4',
        audit_match: 'Found In Other Location'
      },
      {
        uuid: 'found elsewhere 5',
        audit_match: 'Found In Other Location'
      },
      {
        uuid: 'found elsewhere 6',
        audit_match: 'Found In Other Location'
      },
      {
        uuid: 'no match 1',
        audit_match: 'No Match'
      },
      {
        uuid: 'no match 2',
        audit_match: 'No Match'
      },
      {
        uuid: 'no match 3',
        audit_match: 'No Match'
      },
      {
        uuid: 'no match 4',
        audit_match: 'No Match'
      },
      {
        uuid: 'no match 5',
        audit_match: 'Missing'
      },
      {
        uuid: 'Missing 1',
        audit_match: 'No Match'
      },
      {
        uuid: 'Missing 2',
        audit_match: 'Missing'
      },
      {
        uuid: 'Missing 3',
        audit_match: 'Missing'
      },
      {
        uuid: 'Missing 4',
        audit_match: 'Missing'
      },
      {
        uuid: 'Expired 1',
        audit_match: 'Expired'
      },
      {
        uuid: 'Expired 2',
        audit_match: 'Expired'
      },
      {
        uuid: 'Expired 3',
        audit_match: 'Expired'
      },
      {
        uuid: 'Other 1',
        audit_match: 'Other'
      },
      {
        uuid: 'Other 2',
        audit_match: 'Other'
      },
    ];

  });
  it('should display the grouped sums of audit items', () => {
    renderAuditStatistics();
    for(let i = 2; i < 9; i++) {
      screen.getByText(`${i}`);  //TODO:  Need something fancier here
    }
  });
});
