import {BrowserRouter} from "react-router-dom";
import {TabsBar} from "../TabsBar";
import {render, screen, within} from "@testing-library/react";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";

type RenderedButton = (HTMLElement | null);

interface RenderedTabs {
  snapshots: RenderedButton;
  search: RenderedButton;
  consignments: RenderedButton;
  consignment: RenderedButton;
  consignmentExpiration: RenderedButton;
  audit: RenderedButton;
  upload: RenderedButton;
  history: RenderedButton;
  procedures: RenderedButton;
  accounts: RenderedButton;
  reports: RenderedButton;
  settings: RenderedButton;
}

const renderTabs = (): RenderedTabs => {
  const TabsComponent = () => {
    return (
      <BrowserRouter>
        <TabsBar/>
      </BrowserRouter>
    );
  }
  render(<TabsComponent/>);

  function findChild(parentName, childName) {
    // screen.debug();
    const parent = screen.queryByRole('button', {name: parentName});
    if (parent) {
      return within(parent).queryByRole('link', {name: childName})
    }
    return null;
  }

  return {
    get snapshots() {
      return screen.queryByRole('link', {name: 'Snapshots'})
    },
    get search() {
      return screen.getByRole('link', {name: /Search/i})
    },
    get consignments() {
      return screen.queryByRole('button', {name: 'Consignments'})
    },
    get consignment() {
      return findChild('Consignments', 'Consignment');
    },
    get consignmentExpiration() {
      return findChild('Consignments', 'Expiration');
    },
    get audit() {
      return findChild('Consignments', 'Audit');
    },
    get upload() {
      return findChild('Audit', 'Upload');
    },
    get history() {
      return findChild('Audit', 'History');
    },
    get procedures() {
      return screen.getByRole('link', {name: /Procedures/i})
    },
    get accounts() {
      return screen.getByRole('link', {name: /Accounts/i})
    },
    get reports() {
      return screen.getByRole('link', {name: /Reports/i})
    },
    get settings() {
      return screen.getByRole('link', {name: /Settings/i})
    },
  }
}


describe('TabsBar', () => {
  let buttons;

  const expandedButtons = (set: ('Consignments' | 'Audits'), supposedToBeExpanded: boolean) => {
    let buttonNames;
    switch (set) {
      case 'Consignments':
        buttonNames = ['consignment', 'consignmentExpiration', 'audit'];
        break;
      case 'Audits':
        buttonNames = ['upload', 'history'];
        break;
      default:
    }
    buttonNames.forEach((bn: string) => {
      // console.log(`checking if ${bn} is ${supposedToBeExpanded ? 'expanded' : 'collapsed'}`);
      const button = buttons[bn];
      switch (true) {
        case button && supposedToBeExpanded:
          expect(button).toBeInTheDocument();
          break;
        case button && !supposedToBeExpanded:
          expect(button).not.toBeInTheDocument();
          break;
        case supposedToBeExpanded:
          expect(button).toBeDefined();
          break;
        default:
          expect(button).toBeFalsy();
      }
    });
  }

  beforeEach(() => {
    buttons = renderTabs();
  });
  it('should display the Search button as active', () => {
    expect(buttons.search).toBeInTheDocument();
    expect(buttons.search).toBeEnabled();
    expect(buttons.search).toHaveClass('tab-active');
  });
  it('should display the Snapshots button as disabled', () => {
    expect(buttons.snapshots).toBeInTheDocument();
    expect(buttons.snapshots).toHaveClass('tab-disabled');
  });
  it('should display the Procedures button as disabled', () => {
    expect(buttons.procedures).toBeInTheDocument();
    expect(buttons.procedures).toHaveClass('tab-disabled');
  });
  it('should display the Accounts button as enabled', () => {
    expect(buttons.accounts).toBeInTheDocument();
    expect(buttons.accounts).not.toHaveClass('tab-disabled');
    expect(buttons.accounts).toHaveClass('tab-normal');
  });
  it('should display the Reports button as disabled', () => {
    expect(buttons.reports).toBeInTheDocument();
    expect(buttons.reports).toHaveClass('tab-disabled');
  });
  it('should display the Settings button as disabled', () => {
    expect(buttons.settings).toBeInTheDocument();
    expect(buttons.settings).toHaveClass('tab-disabled');
  });
  it('should display the Consignments button as enabled', () => {
    expect(buttons.consignments).toBeInTheDocument();
    expect(buttons.consignments).toBeEnabled();
    expect(buttons.consignments).toHaveClass('tab-normal');

  });
  it('should display expanded consignments items when the consignments button is clicked', () => {
    const button = screen.getByRole('button', {name: /Consignments/i})
    expect(button).toBeInTheDocument();
    expandedButtons('Consignments', false);
    userEvent.click(button);
    expandedButtons('Consignments', true);
  });
  it('should no longer display expanded consignments items when the consignments button is clicked again', () => {
    let button = screen.getByRole('button', {name: /Consignments/i})
    expect(button).toBeInTheDocument();
    userEvent.click(button);
    expandedButtons('Consignments', true);
    button = screen.getByRole('button', {name: /Consignments/i})
    expect(button).toBeInTheDocument();
    userEvent.click(button);
    expandedButtons('Consignments', false);
  });
  it('should display expanded audit items when the consignments and audit buttons is clicked', () => {
    userEvent.setup();
    const cbutton = screen.getByRole('button', {name: /Consignments/i})
    const abutton = screen.getByRole('button', {name: /Audit/i})
    expect(abutton).toBeInTheDocument();
    userEvent.click(cbutton).then(() => {
      expandedButtons('Consignments', false);
      return userEvent.click(abutton);
    }).then(() => {
      expandedButtons('Audits', true);
    });
  });
})
