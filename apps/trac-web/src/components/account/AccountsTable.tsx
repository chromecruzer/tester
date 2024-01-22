import {useQuery} from "@tanstack/react-query";
import React, {useEffect, useMemo, useState} from "react";
import DatePicker from "react-datepicker";
import _ from "lodash";
import {accountTotalsColumns, CustomerRecord, dateNow, EmailStatusType, formatTracDate} from "@trac/datatypes";
import {TracTable} from "../tables/TracTable";
import {DownloadButton} from "../tables/DownloadButton";
import {getAccounts} from "../../api/salesRepApi";
import {getMissingEmails} from "../../api/emailApi";
import BatchAccounts from "./BatchAccounts";
import PagesMap from "../../navigation/PagesMap";
import {useNavigate} from "react-router";
import {AccountContextMenu} from "./AccountContextMenu";
import {BatchEmailDialog} from "../email/BatchEmailDialog";

const dump = obj => JSON.stringify(obj, null, 2);
const batchEdit = new BatchAccounts();
const pagesMap = new PagesMap();


export const AccountsTable = ({salesUuid}) => {
  const [expiredOnly, setExpiredOnly] = useState(false);
  const [expirationDate, setExpirationDate] = useState(dateNow())
  const [stillLoading, setStillLoading] = useState(false);
  const [accounts, setAccounts] = useState([] as CustomerRecord[]);
  const [batchEmailOpen, setBatchEmailOpen] = useState(false);
  const navigateTo = useNavigate();
  // console.log(`initial settings expired only = ${expiredOnly} expiration date is ${expirationDate}`)
  const accountsQuery = date => ({
    queryKey: ['accounts', date],
    queryFn: () => {
      // console.log(`calling getAccounts with ${salesUuid} and ${expirationDate}`)
      setStillLoading(true);
      return getAccounts(salesUuid, formatTracDate(date))
    },
    select: data => {
      return data;
    },
    onSettled: () => setStillLoading(false),
    notifyOnChangeProps: [salesUuid, expirationDate],
    enable: !!salesUuid,
  });
  const missingQuery = {
    queryKey: ['missing'],
    queryFn: () => getMissingEmails(),
    select: data => {
      return data;
    }
  }
  const {
    error,
    data
  } = useQuery(accountsQuery(expirationDate));
  const {data: missing} = useQuery(missingQuery);
  useEffect(() => {
    // console.log(`checking accounts expired only = ${expiredOnly}`);
    const extractMissing = code => {
      if(_.has(missing, code)) {
        return missing[code].emailStatus;
      }
      return null;
    };
    const supplemented = _.map(data, d => ({
      ...d,
      missingEmails: extractMissing(d.customer_code),
      last_expire_email: d.last_expire_email ? formatTracDate(d.last_expire_email) : null,
    }))
    if (expiredOnly) {
      setAccounts(_.filter(supplemented, d => d.totalExpired > 0));
      return;
    }
    setAccounts(_.isArray(supplemented) ? [...supplemented] : []);
  }, [data, expiredOnly, missing])

  const uuidMap = useMemo(() => {
    return _.reduce(accounts, (accum, a) => {
      accum[a.uuid] = a;
      return accum;
    }, {});
  }, [accounts])
  const handleSingleClick = uuids => {
    batchEdit.setSelectedUuids(uuids);
    batchEdit.setUuidMap(uuidMap);
  }
  const handleDoubleClick = uuid => {
    if (uuid) {
      // console.log(`navigating to audit page with ${uuid} /${pagesMap.page('Audit Work', [], {uuid: uuid})}`)
      navigateTo(`/${pagesMap.page('Expiration', [], {customerId: uuidMap[uuid].customer_code})}`);
    }
    return true;
  }
  const errorMessage = error && <h4>Network Error</h4>;
  const loadingMessage = stillLoading &&
    <h4>Processing...</h4>
  const handleDate = date => {
    setExpirationDate(date);
  }
  // console.log('accounts for the table', accounts, data);
  return <>
    {errorMessage}
    {loadingMessage}
    <BatchEmailDialog
      orders={batchEdit.sendEmailOrders()}
      open={batchEmailOpen}
      requestClose={() => setBatchEmailOpen(false)}
      message={batchEdit.getEmailSummary()}
    />
    <AccountContextMenu
      sendBatch={() => setBatchEmailOpen(true)}
      sendIsReady={true}>
    <TracTable
      data={accounts}
      columns={accountTotalsColumns}
      singleClickAction={handleSingleClick}
      doubleClickAction={handleDoubleClick}
      isMultiSelect={true}
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
        {expiredOnly ? 'Expired Only' : 'All Accounts'}</button>
      <DownloadButton headers={accountTotalsColumns}
                      data={accounts}
                      downloadType='spreadsheet'
      />
    </TracTable>
    </AccountContextMenu>
  </>
}
