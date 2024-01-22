import React from "react";
import * as LogInUserMock from "../UseLoginUser";
import {render, screen} from "@testing-library/react";
import {Layout} from "../Layout";


jest.mock('../components/AppHeader', () => ({
  AppHeader: props => (<>
    <h4>Mock Application Header</h4>
  </>),
}))

jest.mock('../components/Notification', () => ({
  Notification: props => (<>
    <h4>Mock Notification</h4>
  </>),
}))

jest.mock('../Login', () => ({
  Login: props => (<>
    <h4>Mock Login</h4>
  </>),
}))

jest.mock('../TabsBar', () => ({
  TabsBar: props => (<>
    <h4>Mock TabsBar</h4>
  </>),
}))

describe('Layout', () => {
  const appUser = (user = null as (string | null)) => {
    const useLoginUserMock = jest.spyOn(LogInUserMock, 'UseLoginUser');
    useLoginUserMock.mockReturnValue({
      clearAppUser: jest.fn(),
      setAppUser: jest.fn(),
      appUser: user
    });
  }
  const renderLayout = () => {
    return render(<Layout>My Kids</Layout>);
  }
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should display login page if there is no app user', () => {
    appUser();
    renderLayout();
    // screen.debug();
    screen.getByText('Mock Login');
  });
  it('should display the tabs and notification if a user exists', () => {
    appUser('Twiggy Bark');
    renderLayout();
    // screen.debug();
    screen.getByText('Mock Notification');
    screen.getByText('My Kids');
  });
});
