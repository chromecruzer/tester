import {useEffect} from "react";
import {CustomerRecord, NullableString} from "@trac/datatypes";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getCustomers} from "../../api/customerApi";
import {useTracContext} from "../../TracContext";

const dump = obj => JSON.stringify(obj, null, 2);
export const LoadAccountIntoContext = ({accountCode = null as NullableString}) => {
  const {getTracContext, setTracContext} = useTracContext();
  const queryClient = useQueryClient();
  const accountFromContext = getTracContext('customerAccount') as CustomerRecord || null;
  const {
    isError,
    data: account
  } = useQuery(['account', accountCode],
    () => getCustomers({customerId: accountCode}), {
      select: data => {
        // console.log(`queried customer ${accountCode}`,data)
        return data
      },
      enabled: !!accountCode,
    })
  if (isError) {
    // console.error(`Server returned an error ${error}`)
  }
  const retrievedAccount = account ? account[0] : null;
  useEffect(() => {
    if(accountCode !== null && accountCode !== retrievedAccount?.customer_code) {
      queryClient.invalidateQueries();
    }
  })
  useEffect(() => {
    // console.log(`checking retrieved account against ${accountCode}`, retrievedAccount, accountFromContext);
    if (retrievedAccount?.customer_code === accountCode) {
      if (accountFromContext === null ||
        accountFromContext.customer_code !== (retrievedAccount as CustomerRecord).customer_code) {
        // console.log('setting account context', accountFromContext);
        setTracContext('customerAccount', retrievedAccount);
      }
    }
  }, [accountCode, retrievedAccount]);
  // console.log(`Loading account from context using ${accountCode}`, retrievedAccount);
  // console.log('Existing account context is ', accountFromContext);

  return null;
}
