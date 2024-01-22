import * as _ from 'lodash';
import React, {useMemo} from "react";
import {
  auditTableColumns, ExpirationCalculations, formatTracDate,
} from "@trac/datatypes";
import {AuditLocation} from "./AuditLocation";
import {useQuery} from "@tanstack/react-query";
import AuditScanFormatter from "../../api/formatters/AuditScanFormatter";
import {TracTable} from "../tables/TracTable";
import {LoadAccountIntoContext} from "../account/LoadAccountIntoContext";
import {getComparisons} from "../../api/uploadApi";
import {DownloadButton} from "../tables/DownloadButton";
import {AuditStatistics} from "./AuditStatistics";
import {LoadSalesRepIntoContext} from "../account/LoadSalesRepIntoContext";
import {LoadAuditIntoContext} from "./LoadAuditIntoContext";

const dump = obj => JSON.stringify(obj, null, 2);

export const AuditScanUploadTable = ({session}) => {
  const {
    data: audit
  } = useQuery(['audit', session],
    () => getComparisons(session, 'audit_scans'), {
      select: data => {
        console.log(`queried  audit details ${session}`,data)
        const formatter = new AuditScanFormatter();
        return formatter.format(data?.comparisons)
      },
      enabled: !!session,
    })


  const tableRowFormattter = matches => {
    const calcs = new ExpirationCalculations();
    const result = _.map(matches, m => {
      return ({
        ...m,
        consignment_location: m.consignment_location || '',
        item: m.item || '',
        family: m.family || '',
        description: m.description || '',
        expire_date: m.expire_date ? formatTracDate(m.expire_date) : '',
        audit_match: m.audit_match === 'Other' ? '' : m.audit_match,
      })
    });
    return calcs.decorateRecords(result);
  };
  const summary = useMemo(() => audit?.location, [audit])
  const locationDisplay = audit ?
    <>
      <LoadAuditIntoContext summary={summary?.location}/>
      <AuditLocation summary={summary}/>
    </> : null;

  const columns = useMemo(() => auditTableColumns, []);
  const data = useMemo(() => {
    if (audit) {
      return [
        ...tableRowFormattter(audit.matches),
        ...tableRowFormattter(audit.moved),
        ...tableRowFormattter(audit.nomatches),
        ...tableRowFormattter(audit.missing),
      ]
    } else {
      return [];
    }
  }, [audit]);

  return <>
    {locationDisplay}
    {data.length > 0 && <>
      <AuditStatistics auditItems={data || []}/>
      <TracTable
      columns={columns}
      data={data}
      needGlobalFilter={true}
      getRowIdFn={r => r.lot}
    >
      <DownloadButton headers={columns}
                      data={data}
                      downloadType='spreadsheet'
      />
    </TracTable>
    </>}
  </>
};
