import React, {useEffect} from "react";
import {ExpirationsTable} from "../components/consignments/ExpirationsTable";
import {useNavigate} from "react-router";
import {useSearchParams} from "react-router-dom";
import {useTracContext} from "../TracContext";
import _ from "lodash";
import {AccountFromContext} from "../components/account/AccountFromContext";
import PagesMap from "../navigation/PagesMap";
import {CustomerRecord, dataTableNames, getDataFields} from "@trac/datatypes";
import {SearchWithAutoComplete} from "../components/search/SearchWithAutoComplete";
import {LoadAccountIntoContext} from "../components/account/LoadAccountIntoContext";
import {LoadSalesRepIntoContext} from "../components/account/LoadSalesRepIntoContext";

const pagesMap = new PagesMap();
const Expiration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams({});
  const page = 'Expiration';
  const idFromParams = searchParams.get(getDataFields['customerId']) || null;
  const {getTracContext, setTracContext} = useTracContext();
  const accountFromContext = getTracContext('customerAccount') as CustomerRecord;
  useEffect(() => {
    const filters = {};
    filters[dataTableNames.customers] = true;
    setTracContext('search', {filters})
  }, []);
  useEffect(() => {
    if (_.isString(accountFromContext?.customer_code) && idFromParams === null) {
      navigate(`/${pagesMap.page(page, [], {customerId: accountFromContext.customer_code})}`);
    }
  }, [idFromParams, accountFromContext])
  const doReset = () => {
    setTracContext('customerAccount', null);
    navigate(`/${pagesMap.page(page)}`);
  }
  const choose = match => {
    console.log('chose', match);
    navigate(`/${pagesMap.page(page, [], {customerId: match.suggestions.consignment_id})}`);
  }
  return <div className='flex-col'>
    {!_.isNull(idFromParams) ? <>
        <LoadAccountIntoContext accountCode={idFromParams}/>
        <LoadSalesRepIntoContext accountCode={idFromParams}/>
        <AccountFromContext>
          <button className='button button-enabled-outlined' onClick={doReset}>
            Change Account
          </button>
        </AccountFromContext>
        <ExpirationsTable idFromParams={idFromParams}/>
      </>
      : <SearchWithAutoComplete setChosen={choose} label={'Find Account'}>
      </SearchWithAutoComplete>}
  </div>
};
export default Expiration;
