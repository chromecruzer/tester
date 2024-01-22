import _ from "lodash";
import React, {useEffect, useState} from "react";
import {
  CustomerRecord,
  emailStatusFn,
  EmailStatusType,
  SalesRepRecord,
  salesRoles
} from "@trac/datatypes";
import {useTracContext} from "../../TracContext";
import {getMissingEmails} from "../../api/emailApi";
import {useQuery} from "@tanstack/react-query";

export const AuditLocation = ({summary,
                                setEmailSendStatus = (status: EmailStatusType) => {return}}) => {
  const [emailStatus, setEmailStatus] = useState(null as EmailStatusType);
  const {getTracContext} = useTracContext();
  const customer = getTracContext('customerAccount') as CustomerRecord;
  const salesRep = getTracContext('salesRep') as SalesRepRecord;
  // console.log(`audit summary location code to be displayed ${summary?.location_code}
  // customer ${customer?.name} ${customer?.customer_code}
  // salesrep ${salesRep?.first_name} ${salesRep?.last_name}`);
  const {data: missingEmails} = useQuery({
    queryKey: ['missingEmails'],
    queryFn: () => getMissingEmails(),
    select: data => data,
  });
  useEffect(() => {
    if (customer && missingEmails) {
      // console.log(`customer and missing emails`, customer, missingEmails);
      // const {accountEmails, salesEmails} = missingEmails['01219690'];
      const {accountEmails, salesEmails} = missingEmails[customer.customer_code];
      // console.log(`emails for ${customer.customer_code}`, accountEmails || [], salesEmails || [], missingEmails);
      const newStatus = emailStatusFn(accountEmails, salesEmails);
      setEmailSendStatus(newStatus);
      setEmailStatus(newStatus);
    }
  }, [customer, missingEmails])

  const name = _.has(customer, 'name') ?
    <>
      <h4 className='py-2 px-1'>Name: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{customer?.name}</span>
    </> : null;
  // console.log('customer account', customer);
  // console.log('email status', emailStatus)
  const salesRepIdentity = salesRep === null ? null :
    <>
      <h4 className='py-2 px-1'>Sales Rep: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{`${salesRep?.first_name} ${salesRep?.last_name}`}</span>
      <h4 className='py-2 px-1'>Role: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{`${salesRoles[(salesRep.role || 'STM')].role}
      (${salesRep.role || 'STM'})`}</span>
    </>;

  const address = _.has(customer, 'address') ?
    <div className='flex justify-start items-start'>
      <h4 className='py-2 px-1'>Address: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{customer?.address}</span>
      <h4 className='py-2 px-1'>City: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{customer?.city}</span>
      <h4 className='py-2 px-1'>State: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{customer?.state}</span>
      <h4 className='py-2 px-1'>Postal: </h4>
      <span className='py-2 px-1 text-bl-text-dark'>{customer?.postal}</span>
    </div> : null;

  return <div className='flex'>
    <div className='flex-col'>
      <div className='flex justify-start items-start'>
        <h4 className='py-2 px-1'>Status: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{summary?.status}</span>
        {name}
        <h4 className='py-2 px-1'>Account Code: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{summary?.location_code}</span>
        {salesRepIdentity}
        {emailStatus && <span className='py-2 px-1 text-red-700'>{emailStatus} {emailStatus === 'MISSING ALL'
          ? 'EMAILS' : 'EMAIL'}</span>}
      </div>
      {address}
      <div className='flex justify-start items-start'>
        <h4 className='py-2 px-1'>Scanned: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{summary?.scan_date}</span>
        <h4 className='py-2 px-1'>Received: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{summary?.received_date}</span>
        <h4 className='py-2 px-1'>Auditor: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{summary?.auditor}</span>
        <h4 className='py-2 px-1'>Scanner: </h4>
        <span className='py-2 px-1 text-bl-text-dark'>{summary?.scanner}</span>
      </div>
    </div>
  </div>
}
