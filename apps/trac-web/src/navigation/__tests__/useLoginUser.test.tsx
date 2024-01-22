import {useContext as useContextMock} from "react";
import {UseLoginUser} from "../UseLoginUser";

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useEffect: jest.fn()
}))
describe('useLoginUser', () => {
  let setTrackContextSpy, getItemSpy, setItemSpy, removeItemSpy;
  const setupContext = (tracUserExists = false) => {
    (useContextMock as jest.Mock).mockImplementation(() => ({
      tracState: {appUser: tracUserExists ? 'John Q Public' : null},
      setTracContext: setTrackContextSpy,
    }));
  }
  beforeEach(() => {
    getItemSpy = jest.spyOn(window.localStorage['__proto__'], 'getItem');
    getItemSpy.mockImplementation(() => 'Dorothy R. Public');
    setItemSpy = jest.spyOn(window.localStorage['__proto__'], 'setItem');
    removeItemSpy = jest.spyOn(window.localStorage['__proto__'], 'removeItem');
    setTrackContextSpy = jest.fn();
  });
  it('should set context to local storage', () => {
    setupContext();
    const {appUser, setAppUser, clearAppUser} = UseLoginUser();
    expect(getItemSpy).toBeCalled();
  });
  describe('setAppUser', () => {
    it('should store user in both context and local storage', () => {
      const expected = 'Marilyn Monroe';
      setupContext(true);
      const {appUser, setAppUser, clearAppUser} = UseLoginUser();
      setAppUser(expected);
      expect(setItemSpy).toBeCalledWith('tracUser', expected)
      expect(setTrackContextSpy).toBeCalledWith('appUser', expected)
    });
  });
  describe('clearAppUser', () => {
    it('should clear user in both context and local storage', () => {
      setupContext(true);
      const {appUser, setAppUser, clearAppUser} = UseLoginUser();
      clearAppUser();
      expect(removeItemSpy).toBeCalled();
      expect(setTrackContextSpy).toBeCalledWith('appUser', null)
    });
  });
});
