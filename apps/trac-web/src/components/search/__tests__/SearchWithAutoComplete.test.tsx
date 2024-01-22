import {render, screen} from "@testing-library/react";
import React, {useState as useStateMock} from "react";
import * as reactRedux from "../../../redux/hooks";
import * as reactRouterDom from "react-router-dom";
import * as reactRouter from "react-router";
import userEvent from "@testing-library/user-event";
import {SearchWithAutoComplete} from "../SearchWithAutoComplete";
import util from "util";
import ManageSearchAutoCompleteState from "../ManageSearchAutoCompleteState";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockReturnValue(jest.fn().mockReturnValue(jest.fn())),
  useSelector: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useState: jest.fn(),
}))
jest.mock('../../../redux/searchActions', () => ({
  retrieveSuggestions: jest.fn(),
  searchClear: jest.fn(),
}));
jest.mock('../SearchSuggestions', () => ({
  SearchSuggestions: props => (<>
    <h4>Mock Suggestions</h4>
    <ul>
      <li key='selectSuggestion'>selectSuggestion is {props['selectSuggestion'] ? 'present' : 'absent'}</li>
      <li key='suggestions'>suggestions {props['suggestions'] ? ' are present' : ' are missing'}</li>
    </ul>
  </>),
}))
jest.mock('../SearchFilters', () => ({
  SearchFilters: props => (<>
    <h4>Mock Filter Buttons</h4>
    <ul>
      <li key='changeFilters'>changeFilters is {props['changeFilters'] ? 'present' : 'absent'}</li>
      <li key='buttons'>buttons {props['buttons'] ? ' is present' : ' is missing'}</li>
    </ul>
  </>),
}))

jest.mock('../SearchFilterButtonsState');
jest.mock('../ManageSearchAutoCompleteState');
// console.log(`mocked class ${dump(ManageSearchAutoCompleteState)}`);
// const {default: ManageSearchAutoCompleteStateMockConstructor, setTextParamMock,
//   setFilterParamsMock, setResultsMock, resetMock, changeSearchMock} =
//   (ManageSearchAutoCompleteState as unknown) as typeof ManageSearchAutoCompleteStateMock;
describe('SearchWithAutoComplete', () => {
  let setSearchResults, navigateSpy, useSearchParamsMock, mockReset, mockChangeSearch;;
  const renderSearchWithAutoComplete = () => {
    return render(<SearchWithAutoComplete
      setSearchResults={setSearchResults}
    />)
  }
  beforeEach(() => {
    navigateSpy = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockImplementation(() => navigateSpy);
    useSearchParamsMock = jest.spyOn(reactRouterDom, 'useSearchParams')
      .mockImplementation(() => ([new URLSearchParams(), jest.fn()]));
    jest.spyOn(reactRedux, 'useAppSelector').mockImplementation(() => ({
      loading: false,
      suggestions: [
        'suggestion 1', 'suggestion2'
      ],
      error: ''
    }));
    setSearchResults = jest.fn();
    mockReset =jest.spyOn(ManageSearchAutoCompleteState.prototype, 'reset');
    mockChangeSearch = jest.spyOn(ManageSearchAutoCompleteState.prototype, 'changeSearch');
  });
  it('should return a search box with filter buttons', () => {
    (useStateMock as jest.Mock)
      .mockImplementationOnce(() => ([{filter1: true, filter2: false}, jest.fn()]))
      .mockImplementationOnce(() => ([null, jest.fn()]))
      .mockImplementationOnce(() => ([false, jest.fn()]))
      .mockImplementationOnce(() => ([false, jest.fn()]));
    renderSearchWithAutoComplete();
    screen.getByText('Search');
    screen.getByRole('textbox');
    screen.getByText('Mock Filter Buttons');
    screen.getByText('changeFilters is present');
    screen.getByText('buttons is present');

  });
  it('should render a suggestions list when user has typed something', () => {
    (useStateMock as jest.Mock)
      .mockImplementationOnce(() => ([{filter1: true, filter2: false}, jest.fn()])) //filters
      .mockImplementationOnce(() => (['search text', jest.fn()])) // text
      .mockImplementationOnce(() => ([false, jest.fn()])) //results visible
      .mockImplementationOnce(() => ([true, jest.fn()])); // suggestions visible
    renderSearchWithAutoComplete();
    screen.getByText('Mock Suggestions');
    screen.getByText('selectSuggestion is present');
    screen.getByText('suggestions are present');
  });
  describe('onKeyChange', () => {
    it('should set the results when the key is a return or a tab', () => {
      const [searchTextFn, resultsFn, suggestionsFn] = [jest.fn(), jest.fn(), jest.fn()];
      userEvent.setup();
      (useStateMock as jest.Mock)
        .mockImplementationOnce(() => ([{filter1: true, filter2: false}, jest.fn()])) //filters
        .mockImplementationOnce(() => (['search text', searchTextFn])) // text
        .mockImplementationOnce(() => ([false, resultsFn])) //results visible
        .mockImplementationOnce(() => ([true, suggestionsFn])); // suggestions visible
      renderSearchWithAutoComplete();
      const box = screen.getByRole('textbox');
      return userEvent.type(box, '{Enter}').then(() => {
        console.log('userEvent finished')
        expect(navigateSpy.mock.calls).toMatchSnapshot();
      })
    });
    it('should clear the search results and set suggestions to true for any other key', () => {
      const [searchTextFn, resultsFn, suggestionsFn] = [jest.fn(), jest.fn(), jest.fn()];
      userEvent.setup();
      (useStateMock as jest.Mock)
        .mockImplementationOnce(() => ([{filter1: true, filter2: false}, jest.fn()])) //filters
        .mockImplementationOnce(() => (['pr', searchTextFn])) // text
        .mockImplementationOnce(() => ([false, resultsFn])) //results visible
        .mockImplementationOnce(() => ([false, suggestionsFn])); // suggestions visible
      renderSearchWithAutoComplete();
      const box = screen.getByRole('textbox');
      return userEvent.type(box, 'o').then(() => {
        expect(suggestionsFn).toBeCalledWith( true);
      })
    });
  });
  describe('onChange', () => {
    it('should clear the results of there is no search text', () => {
      const [searchTextFn, resultsFn, suggestionsFn] = [jest.fn(), jest.fn(), jest.fn()];
      userEvent.setup();
      (useStateMock as jest.Mock)
        .mockImplementationOnce(() => ([{filter1: true, filter2: false}, jest.fn()])) //filters
        .mockImplementationOnce(() => (['p', searchTextFn])) // text
        .mockImplementationOnce(() => ([false, resultsFn])) //results visible
        .mockImplementationOnce(() => ([false, suggestionsFn])); // suggestions visible
      renderSearchWithAutoComplete();
      const box = screen.getByRole('textbox');
      return userEvent.type(box, '{Backspace}').then(() => {
        expect(mockReset).toBeCalled();
      })
    });
    it('should set up to display a suggestions list when user has typed a first character', () => {
      userEvent.setup();
      (useStateMock as jest.Mock)
        .mockImplementationOnce(() => ([{filter1: true, filter2: false}, jest.fn()])) //filters
        .mockImplementationOnce(() => ([null, jest.fn()])) // text
        .mockImplementationOnce(() => ([false, jest.fn()])) //results visible
        .mockImplementationOnce(() => ([false, jest.fn()])); // suggestions visible
      renderSearchWithAutoComplete();
      const box = screen.getByRole('textbox');
      return userEvent.type(box, 'p').then(() => {
        expect(mockChangeSearch).toBeCalledWith('p', false);
      })
    });
    it('should set up to display a suggestions list when user has added to the text', () => {
      userEvent.setup();
      (useStateMock as jest.Mock)
        .mockImplementationOnce(() => ([{filter1: true, filter2: false}, jest.fn()])) //filters
        .mockImplementationOnce(() => (['pr', jest.fn()])) // text
        .mockImplementationOnce(() => ([false, jest.fn()])) //results visible
        .mockImplementationOnce(() => ([false, jest.fn()])); // suggestions visible
      renderSearchWithAutoComplete();
      const box = screen.getByRole('textbox');
      return userEvent.type(box, 'o').then(() => {
        expect(mockChangeSearch).toBeCalledWith('pro', false);
      })
    });
  });
});
