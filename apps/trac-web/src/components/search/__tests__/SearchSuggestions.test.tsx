import {SearchSuggestions} from "../SearchSuggestions";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe('SearchSuggestions', () => {
  let selectSuggestion, suggestions;
  const renderSearchSuggestions = () => {
    return render(<SearchSuggestions
      selectSuggestion={selectSuggestion}
      suggestions={suggestions}
      />)
  }
  beforeEach(() => {
    selectSuggestion = jest.fn();
    suggestions = [
      {
        uuid: 'uuid1',
        field: 'sig2 common',
        type: 'customer',
        signature: ['sig1', 'sig2 common']
      },
      {
        uuid: 'uuid2',
        field: 'sig2 special',
        type: 'product',
        signature: ['sig1', 'sig2 special', 'sig3', 'sig4']
      }
    ]
  });
  it('should return a list of suggestions', () => {
    renderSearchSuggestions();
    // screen.debug();
    let item = screen.queryByText('sig2 common');
    if(item === null) {
      throw new Error('Cannot find first suggestion');
    }
    item = screen.queryByText('sig2 special');
    if(item === null) {
      throw new Error('Cannot find second suggestion');
    }
  });
  it('should include tooltips', () => {
    renderSearchSuggestions();
    screen.debug();
    let item = screen.queryByText('customer 0: sig1 1: sig2 common');
    if(item === null) {
      throw new Error('Cannot find first suggestion tooltip');
    }
    item = screen.queryByText('product 0: sig1 1: sig2 special 2: sig3 3: sig4');
    if(item === null) {
      throw new Error('Cannot find second suggestion tooltip');
    }
  });
  it('should call selectSuggestion on click', () => {
    userEvent.setup();
    renderSearchSuggestions();
    // screen.debug();
    const item = screen.queryByText('sig2 common');
    if(item === null) {
      throw new Error('Cannot find first suggestion');
    }
    return userEvent.click(item).then(() => {
      expect(selectSuggestion).toHaveBeenCalledWith('sig2 common');
    })
  });
});
