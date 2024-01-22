import React, {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {DialogModal} from "../tables/DialogModal";
import {postSendEmails} from "../../api/emailApi";
import {NullableString} from "@trac/datatypes";

export const BatchEmailDialog = ({orders, open, requestClose, message = null as NullableString}) => {
  const [isRedirect, setIsRedirect] = useState(false);
  const [cc, setCc] = useState(null);
  const handleClose = () => {
    requestClose();
  }
  const postSendAuditMutation = useMutation({
    mutationFn: async () => {
      return postSendEmails({cc, isRedirect, orders});
    },
    onSettled: async () => {
      handleClose();
    }
  })
  const handleSubmit = () => {
    postSendAuditMutation.mutate();
  }
  const handleCC = e => {
    setCc(e.target.value);
  }
  const handleRedirect = e => {
    setIsRedirect(!isRedirect);
  }

  return <DialogModal open={open} requestClose={handleClose} buttonsOnlySize={true}>
    <div className='flex-col min-h-full min-w-full justify-items-stretch'>
      <div className='flex justify-start items-center'>
        <div className='flex'>
          <h4 className='py-2 px-3'>CC Address</h4>
          <input
            type='text'
            value={cc || ''}
            onChange={handleCC}
            className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
          />
        </div>
        <button className='border-2 px-2 py-2 border-bl-consumer-dark bg-bl-consumer-second p-1' onClick={handleRedirect}>
          {isRedirect ? 'Redirect' : 'Copy'}</button>
      </div>
      {message && <h4>{message}</h4>}
      <div className='flex-row content-between'>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={handleClose}>Cancel</button>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={handleSubmit}>Ok</button>
      </div>
    </div>
  </DialogModal>
}
