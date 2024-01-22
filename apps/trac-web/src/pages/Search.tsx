import _ from 'lodash';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {SearchWithAutoComplete} from "../components/search/SearchWithAutoComplete";
import ErrorBoundary from "../components/ErrorBoundary";
import {SearchFilters} from "../components/search/SearchFilters";
import {useSearchParams} from "react-router-dom";
import PagesMap from "../navigation/PagesMap";
import {TracTable} from "../components/tables/TracTable";
import {dataTableNames} from "@trac/datatypes";
import {postSearchForSuggestions} from "../api/searchApi";
import React, {useEffect} from "react";
import {DownloadButton} from "../components/tables/DownloadButton";
import {useNavigate} from "react-router";
import {SearchSpecifications, useTracContext} from "../TracContext";
import {RowButtonsState} from "../components/search/RowButtonsState";

export const searchButtonTableNames = [dataTableNames.consignments, dataTableNames.customerContacts, dataTableNames.customers,
  dataTableNames.products, dataTableNames.salesReps];
const searchTableColumns = [
  {
    header: 'Record Type',
    accessor: 'type',
    // width: 'col-span-2',
  },
  {
    header: 'Field',
    accessor: 'field',
    // width: 'col-span-2',
  },
  {
    header: 'Identity',
    accessor: 'signature',
    // width: 'col-span-8',
    alignment: 'left'
  },
];
export const searchFilterButtons = [
  {
    state: false,
    title: 'Consignments',
    key: dataTableNames.consignments
  },
  {
    state: false,
    title: 'Customers',
    key: dataTableNames.customers
  },
  {
    state: false,
    title: 'Customer Contacts',
    key: dataTableNames.customerContacts
  },
  {
    state: false,
    title: 'Products',
    key: dataTableNames.products
  },
  {
    state: false,
    title: 'Sales Reps',
    key: dataTableNames.salesReps
  },
];

const suggestionsFormatter = (suggestions) => {
  // console.log('formatting new suggestions', suggestions);
  return _.map(suggestions, s => {
    return {
      ...s,
      signature: _.join(_.reduce(s.signature, (accum, v, k) => {
        if (v) {
          accum.push(`${k}: ${v}`);
        }
        return accum;
      }, [] as string[]), ' '),
    }
  })
};

const pagesMap = new PagesMap();

const Search = () => {
  const navigateTo = useNavigate();
  const [searchParams] = useSearchParams();
  const {getTracContext, setTracContext} = useTracContext();
  // console.log('search in context', getTracContext('search'));
  const {text: searchText, filters: filterMap} = getTracContext('search') as SearchSpecifications;
  // console.log('Search Location', window.location);
  const filtersList = RowButtonsState.mapToList(filterMap);
  const queryClient = useQueryClient();
  useEffect(() => {
    const textFromParam = searchParams.get('text');
    const filtersListFromParams = searchParams.getAll('filters') || [];
    // console.log(`filter list and text from parameters'${textFromParam}'`, filtersListFromParams);
    if (searchText !== textFromParam || !_.isEqual(filtersListFromParams, filtersList)) {
      console.log('setting context for search')
      const buttons = new RowButtonsState(searchFilterButtons, filtersListFromParams)
      setTracContext('search', {text: textFromParam,
        filters: buttons.getStatesMap()});
    }
  }, [searchParams])

  // console.log('Initial filters list', filtersList);

  // console.log('redoing query options', filterMap);
  const {data: tableData} = useQuery({
    queryKey: ['search', searchText, filterMap],
    queryFn: () => postSearchForSuggestions(searchText, filterMap),
    select: data => {
      return suggestionsFormatter(data);
    }
  });

  const setChosen = choice => {
    const filters = filtersList;
    // console.log('choice', choice);
    const text = choice.field == null ? choice.suggestion.field : choice.field;
    // console.log(`search url ${pagesMap.page('Search', [], {text, filters})}`, choice)
    setTracContext('search', {text, filters: filterMap})
    navigateTo(pagesMap.page('Search', [], {text, filters}));
  }
  const changeFilters = filters => {
    // console.log(`navigating for new filter button with text '${searchText}'`, filters, filtersList)
    setTracContext('search', {text: searchText, filters})
    queryClient.invalidateQueries();
    if (_.isString(searchText)) {
      navigateTo(pagesMap.page('Search', [], {text: searchText, filters}));
    }
    // console.log('change filters is done');
  }

  // console.log(`creating search from text '${searchText}'`, filtersList, tableData);
  return <div>
    {_.isString(searchText) ? <>
        <div className='flex-col'>
          <div className='flex justify-start items-start'>
            <h4 className='py-2 px-1'>Search Results:</h4>
            <span className='py-2 px-1 text-bl-text-dark'>{searchText}</span>
            <ErrorBoundary><SearchFilters changeFilters={changeFilters}
                                          filterButtons={searchFilterButtons}/>
            </ErrorBoundary>
          </div>
        </div>
        <TracTable
          columns={searchTableColumns}
          data={tableData}
        >
          <DownloadButton headers={searchTableColumns}
                          data={tableData}
                          downloadType='spreadsheet'/>
        </TracTable>
      </> :
      <ErrorBoundary><SearchWithAutoComplete setChosen={setChosen}>
        <h4 className='py-2 px-3'>Includes:</h4>
        <ErrorBoundary><SearchFilters changeFilters={changeFilters}
                                      filterButtons={searchFilterButtons}/>
        </ErrorBoundary>
      </SearchWithAutoComplete></ErrorBoundary>
    }
  </div>;
}
export default Search;
