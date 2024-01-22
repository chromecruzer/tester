import React, {useContext, useEffect} from 'react';
import _ from "lodash";
import {ConsignmentsTable} from "../components/consignments/ConsignmentsTable";
import {AccountFromContext} from "../components/account/AccountFromContext";
import {useSearchParams} from "react-router-dom";
import {useTracContext} from "../TracContext";
import {useNavigate} from "react-router";
import PagesMap from "../navigation/PagesMap";
import {CustomerRecord, dataTableNames, getDataFields} from "@trac/datatypes";
import {SearchWithAutoComplete} from "../components/search/SearchWithAutoComplete";

const pagesMap = new PagesMap();
const IolConsignments = (props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams({});
  const idFromParams = searchParams.get(getDataFields['customerId']) || null;
  const {getTracContext, setTracContext} = useTracContext();
  const accountFromContext = getTracContext('customerAccount') as CustomerRecord;
  useEffect(() => {
    if(idFromParams === null) {
      if(accountFromContext) {
        navigate(`/${pagesMap.page('Consignment', [], {customerId: accountFromContext.customer_code})}`);
      } else {
        const filters = {};
        filters[dataTableNames.customers] = true;
        setTracContext('filterButtons', filters)
      }

    }
  }, [idFromParams, accountFromContext])

  const doReset = () => {
    setTracContext('customerAccount', null);
    navigate(`/${pagesMap.page('Consignment')}`);
  }
  const setChosen = match => {
    navigate(`/${pagesMap.page('Consignment', [], {customerId: match.consignment_id})}`);
  }

  const consignmentsSummary = !_.isNull(idFromParams) ? <>
      <AccountFromContext>
        <button className='button button-enabled-outlined' onClick={doReset}>
          Search
        </button>
      </AccountFromContext>
      <ConsignmentsTable idFromParams={idFromParams}/>
    </> :
    <SearchWithAutoComplete
      setChosen={setChosen}
    >
    </SearchWithAutoComplete>;

  return <div className='flex-col'>
    {consignmentsSummary}
  </div>
};

export default IolConsignments;
