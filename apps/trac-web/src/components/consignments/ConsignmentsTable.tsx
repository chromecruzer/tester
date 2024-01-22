import _ from "lodash";
import {useMemo, useState} from "react";
import {ExpirationCalculations} from "@trac/datatypes";
import {RowButtonsState} from "../search/RowButtonsState";
import {SearchFilters} from "../search/SearchFilters";
import ErrorBoundary from "../ErrorBoundary";
import {useQuery} from "@tanstack/react-query";
import ConsignmentFormatter from "../../api/formatters/ConsignmentFormatter";
import {getConsignments} from "../../api/consignmentApi";
import {TracTable} from "../tables/TracTable";

const consignmentColumns = [
  {
    accessor: 'description4',
    header: 'Product Family',
    width: 180
  },
  {
    accessor: 'total',
    header: 'Total',
  },
  {
    header: 'Expires In Days',
    columns: [
      {
        accessor: 'tooLate',
        header: 'Expired',
      },
      {
        accessor: 'lessThan30',
        header: '30 Or Less',
      },
      {
        accessor: 'between30and60',
        header: 'Between 30 and 60',
      },
      {
        accessor: 'moreThan60',
        header: 'More Than 60',
      },
    ]
  },
];
const filterButtons = [
  {
    state: false,
    title: 'Premium Only',
    key: 'premium'
  },
  {
    state: false,
    title: 'Standard Only',
    key: 'standard'
  },
];

export const ConsignmentsTable = ({idFromParams}) => {
  const columns = useMemo(() => consignmentColumns, []);
  const {
    isLoading,
    isError,
    error,
    data: consignments
  } = useQuery(['consignments', idFromParams],
    () => getConsignments(idFromParams), {
      select: data => {
        // console.log(`queried consignments ${idFromParams}`,data)
        const formatter = new ConsignmentFormatter();
        return formatter.format(data)
      },
      enabled: !!idFromParams,
    })
  if (isError) {
    console.error(`Server returned an error ${error}`)
  }

  const buttons = new RowButtonsState(filterButtons, []);
  // console.log('consignment filter buttons', buttons)
  const [filters, setFilters] = useState(buttons.getStatesMap());
  buttons.setButtonCallback(setFilters, filters);

  const tableFormatter = (consignments) => {
    const calcs = new ExpirationCalculations();
    return calcs.groupConsignments(consignments, filters);
  };
  const data = useMemo(() => tableFormatter(consignments), [consignments])
  // console.log('location from context', location);
  // console.log('location from selector', consignments);
  // console.log('data for table', data);

  if (_.isEmpty(consignments)) {
    return null;
  } else {
    // console.log('creating table for ', data);
    const cellFormatting = c => {
      switch (c.column.Header) {
        case 'Total':
        case 'Expired':
        case '30 Or Less':
        case 'Between 30 and 60':
        case 'More Than 60':
          return 'text-center';
        default:
          return '';
      }
    };
    const changeFilters = updatedButtons => {
      const result = updatedButtons.getStates();
      switch (true) { // implement toggling
        case result.premium && result.standard && !filters['premium']:
          result.premium = true;
          result.standard = false;
          break;
        case result.premium && result.standard && !filters['standard']:
          result.premium = false;
          result.standard = true;
          break;
      }
      setFilters(result);
    }
    return <ErrorBoundary>
      <TracTable
        data={data}
        columns={columns}
        addCellPropsFn={cellFormatting}
        getRowIdFn={r => r.description4}
        singleClickAction={undefined}
        doubleClickAction={undefined}>
        <SearchFilters changeFilters={changeFilters} filterButtons={filterButtons}/>
      </TracTable>
    </ErrorBoundary>
  }
}
