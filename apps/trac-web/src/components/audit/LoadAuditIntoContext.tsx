import _ from "lodash";
import {useEffect} from "react";
import {useTracContext} from "../../TracContext";
import {AuditLocationRecord, CustomerRecord} from "@trac/datatypes";
import {LoadAccountIntoContext} from "../account/LoadAccountIntoContext";
import {LoadSalesRepIntoContext} from "../account/LoadSalesRepIntoContext";


export const LoadAuditIntoContext = ({summary}) => {
  const {getTracContext, setTracContext} = useTracContext();
  const auditFromContext = getTracContext('auditSummary');
  // console.log('audit summary', summary)
  useEffect(() => {
    // Store audit location into context if there have been changes
    // console.log('resetting audit location', summary, getTracContext('auditSummary'));
    switch(true) {
      case summary !== null && auditFromContext === null:
        setTracContext('auditSummary', summary);
    }
  }, [summary, auditFromContext]);
  return <>
    <LoadAccountIntoContext accountCode={summary?.location_code}/>
    <LoadSalesRepIntoContext accountCode={summary?.location_code}/>
  </>;
}
