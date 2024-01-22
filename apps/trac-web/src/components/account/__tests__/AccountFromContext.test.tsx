import {render, screen} from "@testing-library/react";
import {AccountFromContext} from "../AccountFromContext";
import {useContext as useContextMock} from "react";
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}))

describe('LocationFromContext', () => {
  let mockSetTracContext, location;
  const renderLocationFromContext = () => {
    render(<AccountFromContext>
    <div>I am a children</div>
  </AccountFromContext>)
  }
  beforeEach(() => {
    location = {
      uuid: 'uuid1',
      name: 'Snidely Whiplash',
      customer_code: '007123',
      address: '333 Main Street',
      city: 'Metropolis',
      state: 'Xanadu',
      postal: '23334-0001'
    };
    mockSetTracContext = jest.fn();
    (useContextMock as jest.Mock).mockImplementation(() => ({
      tracState: {
        location: location
      },
      setTracContext: mockSetTracContext,
    }))
  });
  it('should display location data loaded from context', () => {
    renderLocationFromContext();
    screen.getByText('Name:');
    screen.getByText('Snidely Whiplash');
    screen.getByText('Code:');
    screen.getByText('007123');
    screen.getByText('Address:');
    screen.getByText('333 Main Street');
    screen.getByText('City:');
    screen.getByText('Metropolis');
    screen.getByText('Xanadu');
    screen.getByText('Postal:');
    screen.getByText('23334-0001');
  });
});
