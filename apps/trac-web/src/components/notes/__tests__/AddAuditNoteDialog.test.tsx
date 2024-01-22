import * as MockHooks from "../../../redux/hooks";
import * as MockAuditActions from "../../../redux/auditActions";
import userEvent from "@testing-library/user-event";
import {render, screen} from "@testing-library/react";
import {useState as MockUseState} from "react";
import {AddAuditNoteDialog} from "../AddAuditNoteDialog";
import {DateTime} from "luxon";
import {tracDateFormat} from "@trac/datatypes";

jest.mock('react', () => ({
  ... jest.requireActual('react'),
  useState: jest.fn()
}))
jest.mock('../../tables/DialogModal', () => ({
  DialogModal: ({open, requestClose, children}) => (
    <div>
      <h4>open is set to {open}</h4>
      <h4>requestClose is {requestClose ? 'present' : 'absent'}</h4>
      {children}
    </div>)
}))
describe('AddAuditNoteDialog', () => {
  let closeSpy, dispatchSpy, postAuditNotesSpy, setNoteSpy;
  const renderAddAuditNoteDialog = () => {
    render(<AddAuditNoteDialog open={true} requestClose={closeSpy} author={'Beethoven'} location={{uuid:'Vienna'}}/>)
  }
  const useStateReturns = (content) => {
    (MockUseState as jest.Mock).mockImplementation(() => [content, setNoteSpy]);

  }
  beforeEach(() => {
    closeSpy = jest.fn();
    dispatchSpy = jest.fn();
    postAuditNotesSpy = jest.fn();
    setNoteSpy = jest.fn();
    jest.spyOn(MockHooks, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    postAuditNotesSpy = jest.spyOn(MockAuditActions, 'postAuditNotes').mockReturnValue(() => Promise.resolve());
    jest.spyOn(DateTime, 'now').mockImplementation(() => DateTime.fromFormat('07/20/2022',tracDateFormat))
  });
  it('should save a typed note', () => {
    const expected = 'Adding an overall note\n Auf Wiedersehn';
    userEvent.setup();
    useStateReturns(expected);
    renderAddAuditNoteDialog();
    const textArea = screen.getByRole('textbox');
    return userEvent.type(textArea, '!')
      .then(() => {
        expect(setNoteSpy).toBeCalledWith(`${expected}!`);
      })
  });
  it('should submit a typed note', () => {
    const expected = 'Ich bin fertig mit meinen note';
    userEvent.setup();
    useStateReturns(expected);
    renderAddAuditNoteDialog();
    const button = screen.getByRole('button', {name: 'Ok'});
    return userEvent.click(button)
      .then(() => {
        expect(postAuditNotesSpy).toBeCalled();
        expect(dispatchSpy).toBeCalled();
        expect(closeSpy).toBeCalled();
        expect(postAuditNotesSpy.mock.calls).toMatchSnapshot();
      });
  });
});
