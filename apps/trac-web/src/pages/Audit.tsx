import {useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import _ from "lodash";

import {FilterMap, useTracContext} from "../TracContext";
import PagesMap from "../navigation/PagesMap";
import {
  AuditItemRecord,
  AuditLocationRecord,
  auditTableColumns, AuditRecord, CustomerRecord, dateNow,
  ExpirationCalculations,
  formatTracDate,
  NullableString, AuditStatusType, EmailStatusType,
} from "@trac/datatypes";
import {LoadAuditIntoContext} from "../components/audit/LoadAuditIntoContext";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {AuditLocation} from "../components/audit/AuditLocation";
import {formatAuditItem, formatAuditLocation, formatAuditNote} from "../api/formatters";
import NotesPanelState, {NotesPanelControls} from "../components/notes/NotesPanelState";
import BatchEditAudit from "../components/audit/BatchEditAudit";
import {AuditStatistics} from "../components/audit/AuditStatistics";
import {AuditMenu} from "../components/audit/AuditMenu";
import {AddAuditNoteDialog} from "../components/notes/AddAuditNoteDialog";
import {AddItemsNoteDialog} from "../components/notes/AddItemsNoteDialog";
import {ChangeAuditMatchDialog} from "../components/audit/ChangeAuditMatchDialog";
import {AuditContextMenu} from "../components/audit/AuditContextMenu";
import {TracTable} from "../components/tables/TracTable";
import {ItemFilter} from "../components/audit/ItemFilter";
import {NotesPanel} from "../components/notes/NotesPanel";
import NotesMapping from "../components/notes/NotesMapping";
import {getAudit, postAuditNotes, postAuditUpdate, removeAudit} from "../api/auditApi";
import {DownloadButton} from "../components/tables/DownloadButton";
import {ConfirmRemoveAudit} from "../components/audit/ConfirmRemoveAudit";
import {initialItemFilterStates} from "../components/audit/ItemFilterState";
import {BatchEmailDialog} from "../components/email/BatchEmailDialog";

const dump = obj => JSON.stringify(obj, null, 2);

const pagesMap = new PagesMap();
const batchEdit = new BatchEditAudit();
const itemFormatter = (items) => {
  if (_.isEmpty(items)) {
    return [];
  }
  const calcs = new ExpirationCalculations();
  const result = _.map(items, m => {
    return ({
      ...m,
      consignment_location: m.consignment_location || '',
      item: m.item || '',
      family: m.family || '',
      description: m.description || '',
      expire_date: m.expire_date || '',
      audit_match: m.audit_match === 'Other' ? '' : m.audit_match,
    })
  });
  return calcs.decorateRecords(result);
};

const Audit = () => {
  const navigateTo = useNavigate();
  const [searchParams] = useSearchParams({});
  const queryClient = useQueryClient();
  const uuidFromParams = searchParams.get('uuid') || null as NullableString;
  const {getTracContext, setTracContext} = useTracContext();
  const auditFromContext = getTracContext('auditSummary') as AuditLocationRecord;
  const author = getTracContext('appUser') as string;
  const customer = (getTracContext('customerAccount') as CustomerRecord) || null;
  const notesDisplayControls = getTracContext('notesPanelControls') as NotesPanelControls;
  const [currentAudit, setCurrentAudit] = useState(null as (null | AuditRecord));
  const [filteredAuditItems, setFilteredAuditItems] = useState([] as AuditItemRecord[]);
  const [itemFilter, setItemFilter] = useState(initialItemFilterStates as FilterMap);
  // console.log('incoming item filter', itemFilter);
  const [addItemNoteIsOpen, setAddItemNoteIsOpen] = useState(false);
  const [addAuditNoteIsOpen, setAddAuditNoteIsOpen] = useState(false);
  const [changeMatchIsOpen, setChangeMatchIsOpen] = useState(false);
  const [confirmRemoveAuditIsOpen, setConfirmRemoveAuditIsOpen] = useState(false);
  const [batchEmailOpen, setBatchEmailOpen] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const notesPanelState = new NotesPanelState(notesDisplayControls);
  batchEdit.setAuthor(author);
  useEffect(() => {
    // console.log(`use effect for audit from search params ${uuidFromParams} from context`, auditFromContext)
    switch (true) {
      case _.isObject(auditFromContext) && uuidFromParams === null:
        navigateTo(`/${pagesMap.page('Audit Work', [],
          {uuid: (auditFromContext as AuditLocationRecord).uuid})}`);
        break;
      case auditFromContext === null && uuidFromParams === null:
        // console.log(` navigating to ${pagesMap.page('Open Audits', [], {})}`)
        navigateTo(`/${pagesMap.page('Open Audits', [], {})}`);
        break;
    }
  }, [auditFromContext, uuidFromParams]);
  // console.log(`context uuid ${salesUuid}`, auditFromContext, author, customer);
  const {
    isLoading,
    isError,
    error,
    data: audit,
  } = useQuery(['audit', uuidFromParams],
    () => getAudit(uuidFromParams),
    {
      select: data => {
        // console.log(`raw audit data from ${uuidFromParams}`, data);
        return {
          location: formatAuditLocation(data.location),
          items: itemFormatter(_.map(data.items, item => formatAuditItem(item))),
          notes: _.map(data.notes, note => formatAuditNote(note)),
        } as AuditRecord
      },
      enabled: !!uuidFromParams,
    });
  if (isError) {
    console.error(`Server returned an error ${error}`)
  }
  useEffect(() => {
    // console.log(`setting current audit from ${uuidFromParams}`, audit);
    setCurrentAudit(audit || null);
  }, [audit, addItemNoteIsOpen, changeMatchIsOpen]);
  useEffect(() => {
    const filtered = _.filter(audit?.items, r => itemFilter[r.audit_match])
    // console.log('setting filtered audit', filtered);
    setFilteredAuditItems(filtered || []);
  }, [audit, itemFilter, addItemNoteIsOpen, changeMatchIsOpen]);


  // console.log('received entire audit', audit);
  let notesMapping;
  if (currentAudit) {
    batchEdit.setAccount(currentAudit?.location)
    notesMapping = new NotesMapping(currentAudit);

  }

  const postStatusChangeMutation = useMutation({
    mutationFn: async (auditStatus: AuditStatusType) => {
      return postAuditUpdate(uuidFromParams, auditStatus);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries()
    },
  })
  const createOrder = () => ([{
    auditUuid: uuidFromParams,
    accountId: currentAudit?.location.location_code,
    date: formatTracDate(dateNow()),
    templateType: 'Missing'
  }]);
  const deleteAuditMutation = useMutation({
    mutationFn: async () => {
      // console.log(`calling remove audit for ${salesUuid}`);
      return removeAudit(uuidFromParams);
    },
    onSuccess: (data, variables, context) => {
      // console.log(`remove audit executing from onSuccess`);
      queryClient.invalidateQueries();
      // console.log(`remove audit navigating to /${pagesMap.page('Audit History', [], {})}`);
      navigateTo(`/${pagesMap.page('Open Audits', [], {})}`);
    },
    onError(error) {
      console.error(`api returned error`, error);
    }
  });
  const postAuditNotesMutation = useMutation({
    mutationFn: async (note: string) => {
      return postAuditNotes([{
        date_created: formatTracDate(dateNow()),
        author,
        annotate_type: 'Audit',
        annotated_uuid: audit?.location.uuid || '',
        audit_uuid: audit?.location.uuid || '',
        content: note,
      }]);
    },
    onError: (error: NullableString, variables, context) => {
      if (error) {
        console.error('post audit note', error);
      }
    },
  });
  const cellProps = (column, cell, row) => {
    let result = '';
    switch (column.accessor) {
      case 'lot':
        result += notesMapping.getNotes(row?.uuid) ? 'text-bl-consumer-main' : '';
        break;
      case 'expire_date':
        result += 'text-center';
        break;
      case 'expire_status':
        result += row?.expire_status_css || '';
        break;
      default:
        break;
    }
    // console.log(`cellProps for ${column.accessor} = ${dump(cell)}`, result)
    return result;
  }
  const handleItemFilterChange = filters => {
    // console.log('filters have changed', filters)
    queryClient.invalidateQueries();
    setItemFilter(filters);
  }

  const handleAuditStatusChange = status => {
    postStatusChangeMutation.mutate(status);
    postAuditNotesMutation.mutate(`Audit status has been changed to ${status}`);
  }
  const handleSingleClick = uuids => {
    batchEdit.setSelectedUuids(uuids);
  }
  const handleDoubleClick = uuid => {
    notesPanelState.selectItemNote(uuid);
    notesPanelState.setDisplay('Item');
    // console.log('existing trac context', getTracContext('itemFilter'), itemFilter);
    setTracContext('notesPanelControls', notesPanelState.getControls())
  }
  const handleRemoveAudit = () => {
    // console.log('removal confirmation set to open')
    setConfirmRemoveAuditIsOpen(true);
  }
  const removeAuditConfirmed = confirmed => {
    // console.log(`executing removal mutation ${confirmed}`);
    if (confirmed) {
      deleteAuditMutation.mutate();
    }
  }
  const setNotesDisplay = display => {
    notesPanelState.setDisplay(display);
    setTracContext('notesPanelControls', notesPanelState.getControls());
  }
  const closeDialog = (dialog) => {
    switch (dialog) {
      case 'AddAuditNoteDialog':
        setAddAuditNoteIsOpen(false);
        break;
      case 'AddItemsNoteDialog':
        setAddItemNoteIsOpen(false);
        break;
      case 'ChangeAuditMatchDialog':
        setChangeMatchIsOpen(false);
        break;
      case 'ConfirmRemoveAuditDialog':
        setConfirmRemoveAuditIsOpen(false);
        break;
      case 'BatchEmailDialog':
        setBatchEmailOpen(false);
        break;
    }
    queryClient.invalidateQueries();
  }
  const errorMessage = error && <h4>Network Error</h4>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>
  // console.log(`audit with uuid ${salesUuid || 'missing'} and code ${currentAudit?.location.location_code || 'missing'}`, audit)
  const emailStatus = (status: EmailStatusType) => {
    const isEnabled = status !== null;
    if (isEnabled !== emailEnabled) {
      setEmailEnabled(isEnabled);
    }
  };
  return <>
    {errorMessage}
    {loadingMessage}
    {currentAudit && <div className='flex-col'>
      <LoadAuditIntoContext summary={currentAudit?.location}/>
      <AuditLocation summary={currentAudit?.location} setEmailSendStatus={emailStatus}/>
      <div className='flex min-w-full justify-start flex-nowrap'>
        <div className='flex-col'>
          <AuditStatistics auditItems={currentAudit?.items}/>
        </div>
        <AuditMenu
          addAuditNote={() => setAddAuditNoteIsOpen(true)}
          notesState={notesPanelState}
          setNotesDisplay={setNotesDisplay}
          statusChange={handleAuditStatusChange}
          auditStatus={currentAudit?.location.status}
          removeAudit={handleRemoveAudit}
          sendAudit={() => setBatchEmailOpen(true)}
          sendAuditEnabled={emailEnabled}/>
      </div>
      <div className='flex'>
        <div className='w-3/4'>
          <AddAuditNoteDialog
            author={author}
            location={currentAudit?.location}
            open={addAuditNoteIsOpen}
            requestClose={() => closeDialog('AddAuditNoteDialog')}
            auditUuid={uuidFromParams}/>
          <AddItemsNoteDialog
            batchEdit={batchEdit}
            open={addItemNoteIsOpen}
            requestClose={() => closeDialog('AddItemsNoteDialog')}
            auditUuid={auditFromContext?.uuid}/>
          <ChangeAuditMatchDialog
            batchEdit={batchEdit}
            open={changeMatchIsOpen}
            requestClose={() => closeDialog('ChangeAuditMatchDialog')}
            auditUuid={uuidFromParams}/>
          <ConfirmRemoveAudit
            customer={customer}
            setConfirmed={removeAuditConfirmed}
            open={confirmRemoveAuditIsOpen}
            requestClose={() => closeDialog('ConfirmRemoveAuditDialog')}/>
          <BatchEmailDialog
            orders={createOrder()}
            open={batchEmailOpen}
            requestClose={() => closeDialog('BatchEmailDialog')}/>
          <AuditContextMenu
            addNoteAction={() => setAddItemNoteIsOpen(true)}
            changeStatusAction={() => setChangeMatchIsOpen(true)}
            auditStatus={currentAudit?.location.status}>
            <TracTable
              columns={auditTableColumns}
              data={filteredAuditItems}
              createTooltipFn={null}
              addCellPropsFn={cellProps}
              getRowIdFn={r => r.uuid}
              singleClickAction={handleSingleClick}
              doubleClickAction={handleDoubleClick}
              isMultiSelect={true}>
              <ItemFilter filtersHaveChanged={handleItemFilterChange}/>
              <DownloadButton headers={auditTableColumns}
                              data={currentAudit?.items || []}
                              notesMappings={notesMapping}
                              downloadType='auditPdf'
                              pdfDataFilter={(data: AuditItemRecord[]) => _.filter(data, d => d.audit_match === 'Missing')}
                              pdfDate={formatTracDate(dateNow())}
                              customerId={currentAudit?.location.location_code}
                              auditUuid={uuidFromParams}
              />
            </TracTable>
          </AuditContextMenu>
        </div>
        {notesDisplayControls.display !== 'Hide' && <NotesPanel audit={currentAudit}/>}
      </div>
    </div>}
  </>
}
export default Audit;
