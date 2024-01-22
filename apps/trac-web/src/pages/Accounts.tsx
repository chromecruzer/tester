import React, {useEffect} from "react";
import {dataTableNames, getDataFields} from "@trac/datatypes";
import {useNavigate} from "react-router";
import {useTracContext} from "../TracContext";
import PagesMap from "../navigation/PagesMap";
import _ from "lodash";
import {LoadSalesRepIntoContext} from "../components/account/LoadSalesRepIntoContext";
import {SearchWithAutoComplete} from "../components/search/SearchWithAutoComplete";
import {SalesRepFromContext} from "../components/account/SalesRepFromContext";
import {useSearchParams} from "react-router-dom";
import {AccountsTable} from "../components/account/AccountsTable";
import {useQueryClient} from "@tanstack/react-query";
import {SelectSalesRep} from "../components/SelectSalesRep";

const pagesMap = new PagesMap();
const page = 'Accounts';
export const Accounts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams({});
  const salesRepUuidFromParams = searchParams.get(getDataFields['uuid']) || null;
  const {getTracContext, setTracContext} = useTracContext();
  const salesRepFromContext = getTracContext('salesRep');
  const queryClient = useQueryClient();
  useEffect(() => {
    const filters = {};
    filters[dataTableNames.salesReps] = true;
    setTracContext('search', {filters})
  }, []);
  useEffect(() => {
    if(salesRepUuidFromParams === null && _.isString(salesRepFromContext?.uuid)) {
      navigate(`/${pagesMap.page(page,[], {uuid: salesRepFromContext.uuid})}`)
    }
  }, [salesRepUuidFromParams])
  const choose = (choice) => {
    console.log('returned match', choice);
    const uuid = choice.uuid;
    navigate(`/${pagesMap.page(page,[], {uuid})}`)
  };
  const doReset = () => {
    setTracContext('salesRep', null);
    queryClient.invalidateQueries()
    navigate(`/${pagesMap.page(page)}`);
  }
  return <div className='flex-col'>
    {!_.isNull(salesRepUuidFromParams) ? <>
        <LoadSalesRepIntoContext salesRepUuid={salesRepUuidFromParams}/>
        <SalesRepFromContext>
          <button className='button button-enabled-outlined' onClick={doReset}>
            Change SalesRep
          </button>
        </SalesRepFromContext>
        <AccountsTable salesUuid={salesRepUuidFromParams}/>
      </>
      : <SelectSalesRep choose={choose}/>}
  </div>
}
