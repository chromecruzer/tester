import React, {useMemo} from "react";
import {salesRepTableColumns} from "@trac/datatypes";
import {useQuery} from "@tanstack/react-query";
import {TracTable} from "../components/tables/TracTable";
import {DownloadButton} from "../components/tables/DownloadButton";
import {getSalesReps} from "../api/salesRepApi";



export const SalesReps = () => {
  const queryOptions = useMemo(() => {
    return {
      queryKey: ['sales reps'],
      queryFn: () => getSalesReps({}),
      select: data => {
        return data;
      },
    };
  }, [])
  const {data, isLoading, error} = useQuery(queryOptions);
  const columns = useMemo(() => salesRepTableColumns, []);
  const errorMessage = error && <div><h4>Network Error</h4></div>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>

  return <>{data && <TracTable
    columns={columns}
    data={data}
    needGlobalFilter={true}
    isMultiSelect={true}
  >
    <DownloadButton headers={columns}
                    data={data}
                    downloadType='spreadsheet'
    />
  </TracTable>}
    {errorMessage}
    {loadingMessage}
  </>
};
