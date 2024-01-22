import {CustomerRecord, SalesRepRecord, salesRoles} from "@trac/datatypes";
import React, {useMemo} from "react";
import {useTracContext} from "../../TracContext";

export const AccountFromContext = ({children}) => {
  const {getTracContext} = useTracContext();
  const customerAccount = getTracContext('customerAccount') as CustomerRecord;
  const salesRep = getTracContext('salesRep') as SalesRepRecord;
  const salesRepIdentity = useMemo(() => salesRep === null ? null :
    <>
      <h4 className='py-2 px-1'>Sales Rep: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{`${salesRep?.first_name} ${salesRep?.last_name}`}</span>
      <h4 className='py-2 px-1'>Role: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{`${salesRoles[(salesRep.role || 'STM')].role}
      (${salesRep.role || 'STM'})`}</span>
    </>, [salesRep]);
  const nameAccount = customerAccount ? <>
    <h4 className='py-2 px-1'>Name: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{(customerAccount).name}</span>
    <h4 className='py-2 px-1'>Account: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{(customerAccount).customer_code}</span>
  </> : null;

  const addressPostal = customerAccount ? <div className='flex justify-start items-start'>
      <h4 className='py-2 px-1'>Address: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{(customerAccount).address}</span>
      <h4 className='py-2 px-1'>City: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{(customerAccount).city}</span>
      <h4 className='py-2 px-1'>State: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{(customerAccount).state}</span>
      <h4 className='py-2 px-1'>Postal: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{(customerAccount).postal}</span>
    </div>
    : null;

  return <div className='flex'>
    <div className='flex-col'>
      <div className='flex justify-start items-start'>
        {nameAccount}
        {salesRepIdentity}
      </div>
      {addressPostal}
    </div>
    {children}
  </div>
}
