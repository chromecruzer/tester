import {render, screen} from "@testing-library/react";
import {Pagination} from "../Pagination";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";


describe('Pagination', () => {
  let gotoSpy, previousSpy, nextSpy, setSizeSpy;
  beforeEach(() => {
    gotoSpy = jest.fn();
    previousSpy = jest.fn();
    nextSpy = jest.fn();
    setSizeSpy = jest.fn();
  });
  const renderPaginationComponent = (count, index, size) => {
    render(<Pagination
      goToPage={gotoSpy}
      previousPage={previousSpy}
      nextPage={nextSpy}
      pageSize={size}
      pageIndex={index}
      pageCount={count}
      setPageSize={setSizeSpy}
    />)
  }
  const findButton = (label) => {
    const buttons = screen.getAllByRole('button');
    return buttons.find(b => b.getAttribute('aria-label') === label);
  }
    it('should have a goto start button that sets the page to 0', () => {
      renderPaginationComponent(10, 3, 10);
      const button = findButton('first');
      if(button === undefined) {
        throw new Error('First Button could not be found')
      }
      expect(button).toHaveClass('icon-button-enabled-outlined');
      return userEvent.click(button).then(() => {
        expect(gotoSpy).toBeCalledWith(0);
      });
  });
  it('should have a previous button that decrements the page', () => {
    renderPaginationComponent(10, 3, 10);
    const button = findButton('previous');
    if(button === undefined) {
      throw new Error('Previous Button could not be found')
    }
    expect(button).toHaveClass('icon-button-enabled-outlined');
    return userEvent.click(button).then(() => {
      expect(previousSpy).toBeCalled();
    });
  });
  it('should have a next button that increments the page', () => {
    renderPaginationComponent( 10, 3, 10);
    const button = findButton('next');
    if(button === undefined) {
      throw new Error('Next Button could not be found')
    }
    expect(button).toHaveClass('icon-button-enabled-outlined');
    return userEvent.click(button).then(() => {
      expect(nextSpy).toBeCalled();
    });
  });
  it('should have a goto end button that sets the page to the last page', () => {
    const expectedCount = 10;
    renderPaginationComponent(expectedCount, 3, 10);
    const button = findButton('last');
    if(button === undefined) {
      throw new Error('End Button could not be found')
    }
    expect(button).toHaveClass('icon-button-enabled-outlined');
    return userEvent.click(button).then(() => {
      expect(gotoSpy).toBeCalledWith(expectedCount - 1);
    });
  });
  xit('should have a goto page input that goes to a particular page', () => {
    const expectedPage = 1;
    renderPaginationComponent( 10, 3, 10);
    const input = screen.queryByRole('spinbutton');
    if(input === null) {
      throw new Error('Input Goto Page could not be found')
    }
    // TODO: userEvent.type cannot type numbers. Nor can userEvent.keyboard
    userEvent.click(input);
    userEvent.keyboard('1');
    expect(gotoSpy).toBeCalledWith(expectedPage - 1);
  });
  it('should have a page size selector that sets the size to a new value', () => {
    renderPaginationComponent(10, 3, 10);
    const select = screen.queryByRole('combobox');
    if(select === null) {
      throw new Error('Select Page Size could not be found')
    }
    userEvent.selectOptions(select, '100').then(() => {
      expect(setSizeSpy).toBeCalledWith(100);
    });
  });
  it('should have the previous buttons disabled if on the first page', () => {
    renderPaginationComponent(10, 0, 10);
    const firstButton = findButton('first');
    const previousButton = findButton('previous');
    if(firstButton === undefined) {
      throw new Error('First Button could not be found')
    }
    expect(firstButton).toHaveClass('icon-button-disabled');
    if(previousButton === undefined) {
      throw new Error('Previous Button could not be found')
    }
    expect(previousButton).toHaveClass('icon-button-disabled');
  });
  it('should have the next buttons disabled if on the last page', () => {
    renderPaginationComponent(10, 10, 10);
    const lastButton = findButton('last');
    const nextButton = findButton('next');
    if(lastButton === undefined) {
      throw new Error('Last Button could not be found')
    }
    expect(lastButton).toHaveClass('icon-button-disabled');
    if(nextButton === undefined) {
      throw new Error('Next Button could not be found')
    }
    expect(nextButton).toHaveClass('icon-button-disabled');
  });
});
