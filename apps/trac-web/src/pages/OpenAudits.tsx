import React, {useMemo} from 'react';
import _ from 'lodash';
import {useNavigate} from "react-router";
import {useQuery} from "@tanstack/react-query";
import {formatAuditLocation} from "../api/formatters";
import PagesMap from "../navigation/PagesMap";
import {getOpenAudits} from "../api/auditApi";
import {TracTable} from "../components/tables/TracTable";
import {useTracContext} from "../TracContext";

const pagesMap = new PagesMap();
const auditTableColumns = [
  {
    header: 'Account Code',
    accessor: 'location_code',
    alignment: 'left',
  },
  {
    header: 'Account Name',
    accessor: 'location',
    alignment: 'left',
  },
  {
    header: 'Scan Date',
    accessor: 'scan_date',
  },
  {
    header: 'Close Date',
    accessor: 'close_date',
  },
  {
    header: 'Status',
    accessor: 'status',
  },
  {
    header: 'Unresolved Items',
    accessor: 'unresolved',
    alignment: 'right',
  },
  {
    header: 'Auditor',
    accessor: 'auditor',
    alignment: 'right',
  },
  {
    header: 'Scanner',
    accessor: 'scanner',
    alignment: 'right',
  },
]
export const OpenAudits = () => {
  const navigateTo = useNavigate();
  const {setTracContext} = useTracContext();
  const queryOptions =  {
    queryKey: ['open audits'],
    queryFn: () => getOpenAudits(),
  };
  const {
    isLoading,
    isError,
    error,
    data
  } = useQuery(queryOptions)
  if (isError) {
    console.error(`Server returned an error ${error}`)
  }
  const audits = useMemo(() => {
    //console.log(`queried open audits`,data)
    return _.map(data, location => formatAuditLocation(location));
  }, [data])
  // console.log(`audit ${audits} type ${type}`);
  const navigateToAudit = uuid => {
    // console.log('item selection', uuid);
    if(uuid) {
       console.log(`navigating to audit page with ${uuid} /${pagesMap.page('Audit Work', [], {uuid: uuid})}`)
      setTracContext('auditSummary', null);
      setTracContext('customerAccount', null);
      setTracContext('salesRep', null);
      navigateTo(`/${pagesMap.page('Audit Work', [], {uuid})}`);
    }
    return true;
  }
  return <>
    {isLoading && <h4>Loading...</h4>}
    <TracTable
      columns={auditTableColumns}
      data={audits}
      getRowIdFn={r => r.uuid}
      singleClickAction={navigateToAudit}
    >
    </TracTable>
  </>
}
