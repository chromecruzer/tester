import {render, screen} from "@testing-library/react";
import {GlobalFilter} from "../GlobalFilter";
import userEvent from "@testing-library/user-event";

describe('GlobalFilter', () => {
  const renderGlobalFilterComponent = (filteredText, setFilteredText) => {
    render(<GlobalFilter
      filteredText={filteredText}
      setFilteredText={setFilteredText}
    />)
  }
  it('should have no value if filtered text is null', () => {
    renderGlobalFilterComponent(null, jest.fn());
    // screen.debug();
    const textbox = screen.queryByRole('textbox');
    // screen.debug(textbox);
    if (textbox === null) {
      fail('Cannot find text box');
    }
    expect(textbox.getAttribute('class')).toMatchSnapshot();
    expect(textbox.getAttribute('placeHolder')).toEqual('Search');
    expect(textbox.getAttribute('value')).toEqual('');
  });
  it('should create a search input with a prefilled value', () => {
    const expectedValue = 'expectedValue'
    renderGlobalFilterComponent(expectedValue, jest.fn());
    // screen.debug();
    const textbox = screen.queryByRole('textbox');
    // screen.debug(textbox);
    if (textbox === null) {
      fail('Cannot find text box');
    }
    expect(textbox.getAttribute('value')).toEqual(expectedValue);

  });
  it('should call setFiltered text twice when a search is entered', () => {
    const expectedFilterText = 'Text to be Filtered';
    const filteredTextSpy = jest.fn();
    renderGlobalFilterComponent(null, filteredTextSpy);
    // screen.debug();
    const textbox = screen.queryByRole('textbox');
    // screen.debug(textbox);
    if (textbox === null) {
      throw new Error('Cannot find text box');
    }
    return userEvent.type(textbox, expectedFilterText).then(() => {
      expect(filteredTextSpy).toBeCalledTimes(expectedFilterText.length);
    })

  });
});
