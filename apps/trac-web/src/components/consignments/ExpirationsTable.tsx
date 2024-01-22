import _ from "lodash";
import React, {useMemo, useState} from "react";
import DatePicker from "react-datepicker";
import {
  ConsignmentRecord,
  dateNow,
  dateCompare,
  ExpirationCalculations,
  formatTracDate
} from "@trac/datatypes";
import {useQuery} from "@tanstack/react-query";
import ConsignmentFormatter from "../../api/formatters/ConsignmentFormatter";
import {getConsignments} from "../../api/consignmentApi";
import {TracTable} from "../tables/TracTable";
import {DownloadButton} from "../tables/DownloadButton";

const expirationsColumns = [
  {
    accessor: 'description4',
    header: 'Product Family',
    alignment: 'start',
  },
  {
    accessor: 'item',
    header: 'Item',
    alignment: 'start',
  },
  {
    accessor: 'description',
    header: 'Description',
    alignment: 'start',
  },
  {
    accessor: 'lot',
    header: 'Serial',
    alignment: 'start',
  },
  {
    accessor: 'expire_date',
    header: 'Expires By',
    sortingFn: dateCompare,
    alignment: 'center',
  },
  {
    accessor: 'expire_status',
    header: 'Expire Status',
    alignment: 'center',
  },
];
export const ExpirationsTable = ({idFromParams}) => {
  const [expiredOnly, setExpiredOnly] = useState(true);
  const [expirationDate, setExpirationDate] = useState(dateNow())
  const {
    isLoading,
    error,
    data
  } = useQuery(['consignments'],
    () => getConsignments(idFromParams), {
      select: data => {
        const formatter = new ConsignmentFormatter();
        // console.log(`consignment data`, data);
        return formatter.format(data)
      },
      enabled: !!idFromParams,
    })

  const cellFormatting = (column, cell, row) => {
    // console.log('cell formatting', cell);
    switch (column.accessor) {
      case 'expire_status':
        return row?.expire_status_css || '';
      default:
        return '';
    }
  };

  const consignments = useMemo(() => {
    const calc = new ExpirationCalculations(formatTracDate(expirationDate));
    const result = _.filter(calc.decorateRecords(data),
      r => {
        // console.log(`record has expire status of ${r.expire_status}`, r);
        return r.expire_status === 'Expired' || !expiredOnly
      });
    // console.log('formatted consignments', result);
    return result;
  }, [data, expirationDate, expiredOnly]);
  const errorMessage = error && <h4>Network Error</h4>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>
  const handleDate = date => {
    setExpirationDate(date);
  }

  return <>
    {errorMessage}
    {loadingMessage}
    <TracTable
      data={consignments}
      columns={expirationsColumns}
      addCellPropsFn={cellFormatting}
    >
      <div className='flex'>
        <h4 className='py-2 px-3'>Expiration Date</h4>
        <DatePicker
          todayButton='Today'
          selected={expirationDate}
          onChange={handleDate}
          className='border-2 border-bl-consumer-off-white'
        />
      </div>
      <button className='border-2 border-bl-consumer-dark bg-bl-consumer-second p-1'
              onClick={() => setExpiredOnly(!expiredOnly)}>
        {expiredOnly ? 'Expired Only' : 'All Lenses'}</button>
      <DownloadButton headers={expirationsColumns}
                      data={consignments}
                      downloadType='consignmentPdf'
                      pdfDataFilter={(data: ConsignmentRecord[]) => _.filter(data,
                        d => d.expire_status === 'Expired')}
                      pdfDate={formatTracDate(dateNow())}
                      customerId={idFromParams}/>
    </TracTable>
  </>
}
