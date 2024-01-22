import {DialogModal} from "../tables/DialogModal";
import {
  AuditMatch,
  auditMatch, dataTableNames,
  NullableString,
} from "@trac/datatypes";
import React, {useEffect, useState} from "react";
import {MdOutlineClear} from "react-icons/md";
import {SearchWithAutoComplete} from "../search/SearchWithAutoComplete";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {getAudit, postAuditNotes, postBatchPriceUpdate} from "../../api/auditApi";
import {useTracContext} from "../../TracContext";

export const initialLocationSignature = {
  uuid: '',
  customer_code: '',
  warehouse: '',
}

export const ChangeAuditMatchDialog = ({batchEdit, open, requestClose, auditUuid}) => {
  const [note, setNote] = useState('');
  const [match, setMatch] = useState('Other' as AuditMatch);
  const [location, setLocation] = useState(initialLocationSignature);
  const [locationChosen, setLocationChosen] = useState(false);
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const {setTracContext} = useTracContext();
  useEffect(() => {
    const filters = {};
    filters[dataTableNames.customers] = true;
    setTracContext('search', {filters})
  }, [])
  const postAuditNotesMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      handleClose();
      return postAuditNotes(batchEdit.createItemNote(`${note}\nMatch changed to ${match}`,
        'Match'));
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      queryClient.prefetchQuery(['audit'], () => getAudit(auditUuid));
    },
    onError: (error: NullableString, variables, context) => {
      if (error) {
        setError(error);
        console.error('post audit notes', error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
    }
  });

  const postBatchChangeMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      const batch = match === 'Found In Other Location' ?
        batchEdit.moved(location.uuid, location.customer_code, location.warehouse) :
        batchEdit.matchChange(match)
      handleClose();
      return postBatchPriceUpdate(batch);
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      queryClient.invalidateQueries({queryKey: ['audit', auditUuid]})
    },
    onError: (error: NullableString, variables, context) => {
      if (error) {
        setError(error);
        console.error('post audit notes', error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
      handleClose();
    }
  })
  const handleClose = () => {
    setNote('');
    requestClose();
  }
  const choose = (choice) => {
    setLocationChosen(true);
    setLocation({
      ...location,
      customer_code: choice.suggestion.signature.customer_code,
      uuid: choice.suggestion.uuid
    })
  }

  const handleWarehouse = (warehouse: string) => {
    setLocation({...location, warehouse});
  }

  const locationField = locationChosen ?
    <div className='flex justify-start items-start border-2 border-bl-consumer-off-white'>
      <h4 className='py-2 px-3'>Account:</h4>
      <div className='flex border-2 hover: border-bl-consumer-dark'>
        <span className='py-2 px-3 text-bl-text-grey'>{location.customer_code}</span>
        <button onClick={() => setLocationChosen(false)}><MdOutlineClear/></button>
      </div>
    </div> :
    <SearchWithAutoComplete
      setChosen={choose}
    >
    </SearchWithAutoComplete>
  const movedFields = match === 'Found In Other Location' ?
    <div className='flex flex-row'>
      {locationField}
      <div className='flex'>
        <h4 className='py-2 px-3'>Warehouse:</h4>
        <input
          type='text'
          value={location.warehouse || ''}
          onChange={e => handleWarehouse(e.target.value)}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
    </div>
    : null;

  const handleChange = e => {
    setNote(e.target.value);
  }

  const handleNewMatch = e => {
    setMatch(e.target.value);
  }

  const handleSubmit = () => {
    console.log(`change match ${match} with note ${note}`)
    postBatchChangeMutation.mutate();
    postAuditNotesMutation.mutate();
  }

  return <DialogModal open={open} requestClose={handleClose}>
    <div className='flex-col min-h-full min-w-full justify-items-stretch'>
      <div className='flex flex-col justify-start items-center'>
        <div className='flex'>
          <h4 className='py-2 px-3 min-w-0'>Match Type</h4>
          <select
            value={match}
            onChange={handleNewMatch}
            className='py-2 px-3 uppercase cursor-pointer bg-bl-text-light text-bl-text-grey'
          >
            {auditMatch.map(k => (<option key={k}>{k}</option>))}
          </select>
        </div>
        {movedFields}
      </div>
      <h2 className='px-2 py-2 text-center font-bold text-bl-text-dark'>Note</h2>
      <textarea
        value={note}
        rows={8}
        placeholder='Type your note here'
        onChange={handleChange}
        className='border-2 px-2 py-2 grow justify-self-stretch self-stretch min-h-0 min-w-0 w-full h-full'
      />
      <div className='flex-row content-between'>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={handleClose}>Cancel</button>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={handleSubmit}>Ok</button>
      </div>
    </div>
  </DialogModal>
}
