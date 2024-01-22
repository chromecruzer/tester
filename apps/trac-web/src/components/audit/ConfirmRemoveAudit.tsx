import React from "react";
import {DialogModal} from "../tables/DialogModal";

export const ConfirmRemoveAudit = ({customer, setConfirmed, open, requestClose}) => {
  const handleClick = confirmed => {
    setConfirmed(confirmed);
    requestClose();
  }
  // console.log(`customer for removal`, customer);
  return <DialogModal open={open} requestClose={() => handleClick(false)} buttonsOnlySize={true}>
    <div className='flex-col justify-items-stretch'>
      <div className='flex justify-start items-start'>
        <h4 className='py-2 px-1'>Name: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{customer?.name}</span>
        <h4 className='py-2 px-1'>Location Code: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{customer?.customer_code}</span>
      </div>
      <div className='flex-row content-between'>
        <button className='border-2 px-2 py-2 filter-button-active'
                onClick={() => handleClick(false)}>Cancel</button>
        <button className='border-2 px-2 py-2 filter-button-active'
                onClick={() => handleClick(true)}>Confirm</button>
      </div>
    </div>
  </DialogModal>
}
