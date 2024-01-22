import {render, screen} from "@testing-library/react";
import {AddItemsNoteDialog} from "../AddItemsNoteDialog";
import * as MockHooks from '../../../redux/hooks';
import {useState as MockUseState} from 'react';
import * as MockAuditActions from '../../../redux/auditActions'
import userEvent from "@testing-library/user-event";
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
describe('AddItemsNoteDialog', () => {
  let mockedBatch, closeSpy, dispatchSpy, postAuditNotesSpy, setNoteSpy;
  const renderAddNoteDialog = () => {
    render(<AddItemsNoteDialog batchEdit={mockedBatch} open={true} requestClose={closeSpy}/>)
  }
  const useStateReturns = (content) => {
    (MockUseState as jest.Mock).mockImplementation(() => [content, setNoteSpy]);

  }
  beforeEach(() => {
      mockedBatch = {
        createItemNote: jest.fn(),
      };
      closeSpy = jest.fn();
      dispatchSpy = jest.fn();
      postAuditNotesSpy = jest.fn();
      setNoteSpy = jest.fn();
      jest.spyOn(MockHooks, 'useAppDispatch').mockImplementation(() => dispatchSpy);
      postAuditNotesSpy = jest.spyOn(MockAuditActions, 'postAuditNotes').mockReturnValue(() => Promise.resolve());
  });
  it('should save a typed note', () => {
    const expected = 'Adding a note\nAdios!';
    userEvent.setup();
    useStateReturns('Adding a note\nAdios');
    renderAddNoteDialog();
    const textArea = screen.getByRole('textbox');
    return userEvent.type(textArea, '!')
      .then(() => {
        expect(setNoteSpy).toBeCalledWith(expected);
      });
  });
  it('should submit a typed note', () => {
    const expected = 'Recently typed note';
    userEvent.setup();
    useStateReturns(expected);
    renderAddNoteDialog();
    const button = screen.getByRole('button', {name: 'Ok'});
    return userEvent.click(button)
      .then(() => {
        expect(postAuditNotesSpy).toBeCalled();
        expect(dispatchSpy).toBeCalled();
        expect(mockedBatch.createItemNote).toBeCalledWith(expected, 'Item');
        expect(closeSpy).toBeCalled();
      })
  });
});
