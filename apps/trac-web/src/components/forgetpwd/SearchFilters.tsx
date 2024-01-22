import _ from 'lodash';
import {RowButtonsState} from "./RowButtonsState";
import {useEffect, useState} from "react";
import {SearchSpecifications, useTracContext} from "../../TracContext";

export const SearchFilters = ({changeFilters, filterButtons}) => {
  const {getTracContext} = useTracContext();
  const {filters: filterMap} = getTracContext('search') as SearchSpecifications;
  const [filtersList, setFiltersList] = useState([] as string []);
  useEffect(() => {
    setFiltersList(RowButtonsState.mapToList(filterMap));
    // console.log('item filter changing filter list from context', filterMap)
  }, [filterMap])
  const buttons = new RowButtonsState(filterButtons, filtersList);
  // console.log('rendering search filter buttons ', buttons.buttonStates)
  const toggle = (name: string) => {
    // console.log('changing buttons', buttons.buttonStates[name]);
    buttons.toggleButtonState(name);
    setFiltersList(buttons.getStatesArray());
    // console.log('changed buttons', buttons.buttonStates[name]);
    changeFilters(buttons.getStatesArray());
  }
  // console.log(`buttons`, buttons);
  return <div className='flex-row'>
    {_.map(buttons.getStatesMap(false), (value, key) => {
      // console.log(`creating button key ${key} title ${buttons.getButtonTitle(key)}`);
      return <button className={buttons.style(key)} key={key} onClick={e => toggle(key)}>
        {buttons.getButtonTitle(key)}</button>
    })
    }
  </div>
}
