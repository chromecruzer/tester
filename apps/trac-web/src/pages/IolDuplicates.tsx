import React, {useEffect, useMemo} from "react";
import {formatTracDate, iolTableColumns} from "@trac/datatypes";
import {useQuery} from "@tanstack/react-query";
import {TracTable} from "../components/tables/TracTable";
import {DownloadButton} from "../components/tables/DownloadButton";
import {getIolDuplicates} from "../api/consignmentApi";
import _ from "lodash";



export const IolDuplicates = () => {
  const {data, isLoading, error} = useQuery({
    queryKey: ['iol duplicates'],
    queryFn: () => getIolDuplicates(),
    select: data => {
      return _.map(data, i => {
        return {
          ...i,
          received_date: formatTracDate(i.received_date),
          expire_date: formatTracDate(i.expire_date),
          shipped_date: formatTracDate(i.shipped_date),
        };
      });
    },
  });
  const errorMessage = error && <div><h4>Network Error</h4></div>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>

  return <>{data && <TracTable
    columns={iolTableColumns}
    data={data}
    needGlobalFilter={true}
  >
    <DownloadButton headers={iolTableColumns}
                    data={data}
                    downloadType='spreadsheet'
    />
  </TracTable>}
    {errorMessage}
    {loadingMessage}
  </>
};
