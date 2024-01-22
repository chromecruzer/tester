import React, {useMemo, useState} from "react";
import {Comparisons, UploadSupportedFileTypes} from "@trac/datatypes";
import {useParams} from "react-router";
import {useQuery} from "@tanstack/react-query";
import {getComparisons} from "../../api/uploadApi";
import TableOps, {ColumnSpecifications, SortingDirection} from "../tables/TableOps";

const tableColumns: ColumnSpecifications[] = [
  {
    header: 'Action',
    accessor: 'action',
    alignment: 'right'
  },
  {
    header: 'Number of Records',
    accessor: 'sums',
    alignment: 'left'
  },
];
export const UploadDataAnalyticsTable = () => {
  const [sorting, setSorting] = useState<(SortingDirection | null)>(null);
  const {session: sessionFromParams, upload_filetype} = useParams();
  const session = sessionFromParams || null;
  const uploadFileType = (upload_filetype || null) as (UploadSupportedFileTypes | null);
  const {
    isLoading,
    isError,
    error,
    data: comparisons
  } = useQuery(['comparisons', session],
    () => getComparisons(session, uploadFileType), {
      select: data => {
        // console.log(`queried consignments ${session}`,data)
        return data?.comparisons as unknown as Comparisons || {};
      },
      enabled: !!session,
    })
  if (isError) {
    console.error(`Server returned an error ${error}`)
  }
  const data = useMemo(() => {
   return comparisons ? [
      {
        action: 'Adds',
        sums: comparisons['adds']
      },
      {
        action: 'Exists',
        sums: comparisons['exists']
      },
    ] : [];
  }, [comparisons]);
  const getRowId = row => row.action;
  const ops = new TableOps(data, tableColumns, setSorting, sorting);
  const cellProps = (col, cell) => {
    return col.accessor === 'sums' ? '' : 'capitalize right-2 border-bl-text-grey';
  }

  const errorMessage = error && <div><h4>Network Error</h4></div>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>

  return <><table className='border-2 border-b-bl-text-grey'>
        <thead>
          {ops.getHeaders()}
        </thead>
        <tbody>
        {
          ops.getRows().map(r => {
            // console.log(`rows ${r.id}`, r)
            return (
              <tr key={r.action} className='border-2 border-gray-100'
              >
                {
                  tableColumns.map(col => {
                    const cell = r[col.accessor];
                    const cellId = `${r.action}-${col.accessor}`;
                    return (
                      <td key={cellId}  className={cellProps(col,cell)}>{cell}</td>
                    )
                  })}
              </tr>
            )
          })
        }
        </tbody>
      </table>
    {errorMessage}
    {loadingMessage}
    </>
};
