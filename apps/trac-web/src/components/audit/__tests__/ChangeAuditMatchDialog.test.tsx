import {render, screen} from "@testing-library/react";
import {ChangeAuditMatchDialog, initialLocationSignature, LocationSignature} from "../ChangeAuditMatchDialog";
import {useState as MockUseState} from "react";
import * as MockHooks from "../../../redux/hooks";
import * as MockAuditActions from "../../../redux/auditActions";
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
jest.mock('../../location/LocationAutoComplete', () => ({
  LocationAutoComplete: ({page, locationUuid, returnChosen}) => (
    <div>
      <h4>page is set to {page}</h4>
      <h4>locationUuid is set to {locationUuid}</h4>
      <h4>returnChosen is {returnChosen ? 'present' : 'absent'}</h4>
      <button onClick={() => returnChosen({
        field: 'field 1',
        uuid: 'customer uuid',
        type: 'customer',
        signature: {
          uuid: 'location uuid',
          customer_code: 'location code',
          name: 'West Mall',
          address: '123 Mickey Mouse Way',
          city:'Orlando',
          state: 'Florida',
          postal: '123456'
        }
      })}>Choose Location</button>
    </div>)
}))
describe('ChangeAuditMatchDialog', () => {
  let mockedBatch, closeSpy, dispatchSpy, postAuditNotesSpy, postBatchItemAuditUpdateSpy, getAuditItemsSpy,
    setNoteSpy, setMatchSpy, setLocationSpy, setLocationChoseSpy;
  const renderChangeMatchDialog = () => {
    render(<ChangeAuditMatchDialog batchEdit={mockedBatch} open={true} requestClose={closeSpy} auditUuid={'audit uuid'}/>)
  }
  const useStateReturns = (content='', match, location = null as (null | LocationSignature)) => {
    (MockUseState as jest.Mock)
      .mockImplementationOnce(() => [content, setNoteSpy])
      .mockImplementationOnce(() => [match, setMatchSpy])
      .mockImplementationOnce(() => [location || initialLocationSignature, setLocationSpy])
      .mockImplementationOnce(() => [location !== null, setLocationChoseSpy]);
  }
  beforeEach(() => {
    mockedBatch = {
      createItemNote: jest.fn(),
      matchChange: jest.fn(),
      moved: jest.fn()
    };
    closeSpy = jest.fn();
    dispatchSpy = jest.fn();
    setNoteSpy = jest.fn();
    setMatchSpy = jest.fn();
    setLocationChoseSpy = jest.fn();
    setLocationSpy = jest.fn();
    jest.spyOn(MockHooks, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    postAuditNotesSpy = jest.spyOn(MockAuditActions, 'postAuditNotes').mockReturnValue(() => Promise.resolve());
    postBatchItemAuditUpdateSpy = jest.spyOn(MockAuditActions, 'postBatchItemAuditUpdate').mockReturnValue(() => Promise.resolve());
    getAuditItemsSpy = jest.spyOn(MockAuditActions, 'getAudit').mockReturnValue(() => Promise.resolve());
  });
  it('should save a typed note', () => {
    const expected = 'Adding a note\nAdios!';
    userEvent.setup();
    useStateReturns('Adding a note\nAdios', 'Other');
    renderChangeMatchDialog();
    const textArea = screen.getByRole('textbox');
    return userEvent.type(textArea, '!')
      .then(() => {
        // console.log('typing was done');
        expect(setNoteSpy).toBeCalledWith(expected);
      });
  });
  it('should save a match change', () => {
    userEvent.setup();
    useStateReturns('Adding a note\nAdios', 'Other');
    renderChangeMatchDialog();
    const select = screen.getByRole('combobox');
    return userEvent.selectOptions(select, 'Billed').then(() => {
      expect(setMatchSpy).toBeCalledWith('Billed');
    });
  });
  it('should should submit a match change', () => {
    const expected = 'Recently typed note';
    userEvent.setup();
    useStateReturns(expected, 'Billed');
    renderChangeMatchDialog();
    const button = screen.getByRole('button', {name: 'Ok'});
    return userEvent.click(button)
      .then(() => {
        // console.log('OK was clicked');
        expect(postAuditNotesSpy).toBeCalled();
        expect(postBatchItemAuditUpdateSpy).toBeCalled();
        expect(dispatchSpy).toBeCalled();
        expect(mockedBatch.createItemNote.mock.calls).toMatchSnapshot();
        expect(mockedBatch.matchChange).toBeCalledWith('Billed');
        expect(getAuditItemsSpy).toBeCalled();
        expect(closeSpy).toBeCalled();
      })
  });
  it('should display location field when match is "moved"', () => {
    const expected = 'Recently typed note';
    userEvent.setup();
    useStateReturns(expected, 'Found In Other Location');
    renderChangeMatchDialog();
    screen.getByText('page is set to Audit');
    screen.getByText('returnChosen is present');
  });
  it('should save a location', () => {
    const expected = 'Recently typed note';
    userEvent.setup();
    useStateReturns(expected, 'Found In Other Location');
    renderChangeMatchDialog();
    const button = screen.getByRole('button', {name: 'Choose Location'});
    // screen.debug(button)
    return userEvent.click(button)
      .then(() => {
        // console.log('chosen button clicked');
        expect(setLocationChoseSpy).toBeCalledWith(true);
        expect(setLocationSpy.mock.calls).toMatchSnapshot();
      })
  });
  it('should should submit a location with a match changed to "moved"', () => {
    const expected = 'Recently typed note';
    userEvent.setup();
    useStateReturns(expected, 'Found In Other Location', {
      uuid: 'location uuid',
      customer_code: 'location code',
      name: 'West Mall',
      address: '123 Mickey Mouse Way',
      city:'Orlando',
      state: 'Florida',
      postal: '123456'
    });
    renderChangeMatchDialog();
    const button = screen.getByRole('button', {name: 'Ok'});
    return userEvent.click(button)
      .then(() => {
        // console.log('OK was clicked');
        expect(postAuditNotesSpy).toBeCalled();
        expect(postBatchItemAuditUpdateSpy).toBeCalled();
        expect(dispatchSpy).toBeCalled();
        expect(mockedBatch.createItemNote.mock.calls).toMatchSnapshot();
        expect(mockedBatch.moved.mock.calls).toMatchSnapshot();
        expect(getAuditItemsSpy).toBeCalled();
        expect(closeSpy).toBeCalled();
      })
  });
});
