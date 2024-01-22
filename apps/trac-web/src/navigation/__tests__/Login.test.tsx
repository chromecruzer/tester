import * as MockUseLoginUser from '../UseLoginUser';
import userEvent from "@testing-library/user-event";
import {useState as MockUseState} from "react";
import {render, screen} from "@testing-library/react";
import {Login} from "../Login";
jest.mock('react', () => ({
  ... jest.requireActual('react'),
  useState: jest.fn()
}))
describe('Login', () => {
  let setAppUserSpy, setUserSpy;
  const useStateReturns = (content) => {
    (MockUseState as jest.Mock).mockImplementation(() => [content, setUserSpy]);
  }
  const renderLoginPage = () => {
    render(<Login/>);
  }
  beforeEach(() => {
    jest.spyOn(MockUseLoginUser, 'UseLoginUser')
      .mockImplementation(() => ({
        appUser: 'John Q. Public',
        setAppUser: setAppUserSpy,
        clearAppUser: jest.fn()
      }));
    setAppUserSpy = jest.fn();
    setUserSpy = jest.fn();
  });
  it('should save a username', () => {
    const expected = 'Dorothy R. Publi';
    userEvent.setup();
    useStateReturns(expected);
    renderLoginPage();
    const textbox = screen.getByPlaceholderText('Name');
    return userEvent.type(textbox, 'c')
      .then(() => {
        expect(setUserSpy).toBeCalledWith(`${expected}c`);
      });
  });
  it('should submit the username', () => {
    const expected = 'Dorothy R. Publi';
    userEvent.setup();
    useStateReturns(expected);
    renderLoginPage();
    const button = screen.getByRole('button');
    return userEvent.click(button)
      .then(() => {
        expect(setAppUserSpy).toBeCalledWith(expected);
      })
  });
});
