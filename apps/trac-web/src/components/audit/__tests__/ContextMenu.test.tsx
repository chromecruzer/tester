import {AuditContextMenu} from "../AuditContextMenu";
import {render, screen} from "@testing-library/react";
import * as MockReactMenu from '@szhsin/react-menu';
import userEvent from "@testing-library/user-event";

describe('ContextMenu', () => {
  let addNoteSpy,changeStatusSpy;
  const renderContextMenu = () => {
    render(<AuditContextMenu addNoteAction={addNoteSpy} changeStatusAction={changeStatusSpy}>Children</AuditContextMenu>);
  }
  beforeEach(() => {
    addNoteSpy = jest.fn();
    changeStatusSpy = jest.fn();
    jest.spyOn(MockReactMenu, 'useMenuState')
      .mockImplementation(() =>[{endTransition: ()=> {console.log('end transition')}},
        jest.fn().mockReturnValue(true)])
  });
  xit('should call callback when Add Note is clicked', () => {
    userEvent.setup();
    renderContextMenu();
    const clickable = screen.getByText('Children');
    return userEvent.click(clickable)
      .then(() => {
        screen.debug();
      });
  });
  xit('should call callback when Change Status is clicked', () => {
  });
});
