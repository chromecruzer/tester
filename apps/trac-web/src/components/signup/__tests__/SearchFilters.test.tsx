import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import {SearchFilters} from "../SearchFilters";
import {RowButtonsState} from "../RowButtonsState";
import userEvent from "@testing-library/user-event";

describe('SearchFilters', () => {
  let changeFilters, buttons;
  const renderSearchFilters = () => {
    return render(<SearchFilters
      changeFilters={changeFilters}
      buttons={buttons}
    />)
  }
  beforeEach(() => {
    changeFilters = jest.fn();
    const fbuttons = [
      {
        state: false,
        title: 'Customers',
        key: 'customers'
      },
      {
        state: true,
        title: 'Products',
        key: 'products'
      }
    ];
    buttons = new RowButtonsState(fbuttons);
  });
  it('should create a button for every entry specified', () => {
    renderSearchFilters();
    let item = screen.queryByText('Customers');
    if(item === null) {
      throw new Error('Cannot find customers button');
    }
    // screen.debug(item);
    item = screen.queryByText('Products');
    if(item === null) {
      throw new Error('Cannot find products button');
    }
  });
  it('should change the button style depending on state', () => {
    renderSearchFilters();
    let item = screen.queryByText('Customers');
    if(item === null) {
      throw new Error('Cannot find customers button');
    }
    // screen.debug(item);
    expect(item).toHaveClass('filter-button-inactive')
    item = screen.queryByText('Products');
    if(item === null) {
      throw new Error('Cannot find products button');
    }
    // screen.debug(item);
    expect(item).toHaveClass('filter-button-active')
  });
  it('should call the filter params function with the updated buttons when toggled', () => {
    userEvent.setup();
    renderSearchFilters();
    const item = screen.queryByText('Customers');
    if(item === null) {
      throw new Error('Cannot find customers button');
    }
    return userEvent.click(item).then(() => {
      expect(buttons).toMatchSnapshot();
      expect(changeFilters).toBeCalledWith(buttons);
    });
  });
});
