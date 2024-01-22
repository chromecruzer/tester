import {useTracContext} from "../../TracContext";
import {NullableString, SalesRepRecord} from "@trac/datatypes";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getSalesReps} from "../../api/salesRepApi";
import {useEffect, useState} from "react";

export const LoadSalesRepIntoContext = ({salesRepUuid = null as NullableString,
                                          accountCode = null as NullableString}) => {
  const {getTracContext, setTracContext} = useTracContext();
  const [savedAccountCode, setSavedAccountCode] = useState(accountCode);
  const salesRepFromContext = getTracContext('salesRep') as SalesRepRecord || null;
  const queryClient = useQueryClient();
  // console.log(`salesRepFromContext with uuid ${salesRepUuid} or account code ${accountCode}`, salesRepFromContext);
  const {
    data: salesRep
  } = useQuery(['salesRep'],
    () => getSalesReps({uuid: salesRepUuid, customerId: accountCode}), {
      select: data => {
        // console.log(`queried customer ${accountCode} or sales uuid ${salesRepUuid}`,data)
        return data
      },
      enabled: !!salesRepUuid || !!accountCode,
    })
  const retrievedSalesRep = salesRep ? salesRep[0] : null;
  useEffect(() => {
    if(accountCode !== null && accountCode !== savedAccountCode) {
      queryClient.invalidateQueries();
      setSavedAccountCode(accountCode);
    }
    if(salesRepUuid !== null && salesRepUuid !== retrievedSalesRep?.uuid) {
      queryClient.invalidateQueries();
    }
  }, [accountCode, salesRepUuid]);
  useEffect(() => {
      if(salesRepFromContext?.uuid !== retrievedSalesRep?.uuid) {
        setTracContext('salesRep', retrievedSalesRep);
      }
  }, [retrievedSalesRep]);
  return null;
}
