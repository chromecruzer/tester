import React, {useMemo, useState} from "react";
import {accountAuditTotalsColumns, formatTracDate} from "@trac/datatypes";
import {useNavigate} from "react-router";
import {useQuery} from "@tanstack/react-query";
import {getAuditedAccounts} from "../../api/auditApi";
import PagesMap from "../../navigation/PagesMap";
import {TracTable} from "../tables/TracTable";
import {DownloadButton} from "../tables/DownloadButton";
import _ from "lodash";
import {getMissingEmails} from "../../api/emailApi";

const pagesMap = new PagesMap();

export const AuditedAccountsTable = ({salesUuid}) => {
  const navigateTo = useNavigate();
  const [closedAuditsOnly, setClosedAuditsOnly] = useState(false);
  const accountsQuery = {
    queryKey: ['audited accounts'],
    queryFn: () => {
      // console.log(`calling getAccounts with ${salesUuid} and ${expirationDate}`)
      return getAuditedAccounts(salesUuid)
    },
    enable: !!salesUuid,
  };
  const missingQuery = {
    queryKey: ['missing'],
    queryFn: () => getMissingEmails(),
    select: data => {
      return data;
    }
  }
  const {
    error,
    isLoading,
    data
  } = useQuery(accountsQuery);
  const {data: missing} = useQuery(missingQuery);
const accounts = useMemo(() => {
  const extractMissing = code => {
    if(_.has(missing, code)) {
      return missing[code].emailStatus;
    }
    return null;
  };
  let filtered = _.isArray(data) ? [...data] : [];
  if(closedAuditsOnly) {
    filtered = _.filter(data, a => a.latestAuditStatus === 'CLOSED');
  }
  return _.map(filtered, d => ({
    ...d,
    missingEmails: extractMissing(d.customer_code),
    latestAuditDate: d.latestAuditDate ? formatTracDate(d.latestAuditDate) : null,
    last_audit_email: d.last_audit_email ? formatTracDate(d.last_audit_email) : null,
  }));
}, [data, missing, closedAuditsOnly]);
  const uuidMap = useMemo(() => {
    return _.reduce(accounts, (accum, a) => {
      accum[a.uuid] = a;
      return accum;
    }, {});
  }, [accounts])
  const handleSingleClick = uuid => {
    if(uuid) {
      const auditUuid = uuidMap[uuid].latestAuditUuid;
      // console.log(`navigating to audit page with ${uuid} /${pagesMap.page('Audit Work', [], {uuid: uuid})}`)
      if(_.isString(auditUuid)) {
        navigateTo(`/${pagesMap.page('Audit Work', [], {uuid: auditUuid})}`);
      }
    }
    return true;
  }
  const errorMessage = error && <h4>Network Error</h4>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>
  // console.log('accounts for the table', accounts, data);
  return <>
    {errorMessage}
    {loadingMessage}
    <TracTable
      data={accounts}
      columns={accountAuditTotalsColumns}
      singleClickAction={handleSingleClick}
      isMultiSelect={true}
    >
      <button className='border-2 border-bl-consumer-dark bg-bl-consumer-second p-1'
              onClick={() => setClosedAuditsOnly(!closedAuditsOnly)}>
        {closedAuditsOnly ? 'Closed Audits Only' : 'All Accounts'}</button>
      <DownloadButton headers={accountAuditTotalsColumns}
                      data={accounts}
                      downloadType='spreadsheet'
      />
    </TracTable>
  </>
}
