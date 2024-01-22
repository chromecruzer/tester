import {useTracContext} from "../../TracContext";
import {SalesRepRecord, salesRoles} from "@trac/datatypes";
import React from "react";

export const SalesRepFromContext = ({children}) => {
  const {getTracContext} = useTracContext();
  const salesRep = getTracContext('salesRep') as SalesRepRecord;
  const salesName = salesRep && <div className='flex justify-start items-start'>
    <h4 className='py-2 px-1'>Sales Rep: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{`${salesRep.first_name} ${salesRep.last_name}`}</span>
    <h4 className='py-2 px-1'>Title: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{salesRep.title}</span>
    <h4 className='py-2 px-1'>Role: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{`${salesRoles[(salesRep.role || 'STM')].role}
      (${salesRep.role || 'STM'})`}</span>
    <h4 className='py-2 px-1'>Email: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{salesRep.email}</span>
  </div>
  const salesCodes = salesRep && <div className='flex justify-start items-start'>
    <h4 className='py-2 px-1'>Territory: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{salesRep.territory_code}</span>
    <h4 className='py-2 px-1'>Region: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{salesRep.region_code}</span>
    <h4 className='py-2 px-1'>Area: </h4>
    <span className='py-2 px-1 text-bl-text-dark'>{salesRep.area_code}</span>
  </div>
  return <div className='flex-col'>
    {salesName}
    {salesCodes}
    {children}
  </div>

}
