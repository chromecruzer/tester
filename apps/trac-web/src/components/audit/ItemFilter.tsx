import {useState} from "react";
import _ from "lodash";
import {Menu, MenuButton, MenuDivider, MenuHeader, MenuItem} from "@szhsin/react-menu";
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import ItemFilterState, {initialItemFilterStates, ItemPatternName} from "./ItemFilterState";
import {FilterMap} from "../../TracContext";

export const ItemFilter = ({filtersHaveChanged}) => {
  const [filter, setFilter] = useState(initialItemFilterStates as FilterMap);
  const [pattern, setPattern] = useState('Not Matches'as ItemPatternName) ;
  const itemFilterStates = new ItemFilterState(filter, pattern);
  // console.log(`filters for pattern ${pattern}`, filterNames);
  const handlePattern = (pattern) => {
    itemFilterStates.setPattern(pattern);
    setPattern(pattern);
    // console.log(`setting a filter pattern`, pattern);
    setFilter(itemFilterStates.getFilterMap())
    filtersHaveChanged(itemFilterStates.getFilterMap());
  };
  const handleFilter = (filter) => {
    const value = !itemFilterStates.filterState[filter];
    itemFilterStates.setCustom(filter, value);
    setPattern('Custom');
    // console.log(`setting a filter`, filter);
    setFilter(itemFilterStates.getFilterMap())
    filtersHaveChanged(itemFilterStates.getFilterMap());
  };

  return <Menu menuButton={<MenuButton className='align-bottom py-2 px-3 bg-bl-consumer-second'>
    Status Filter</MenuButton>}>
    {_.map(itemFilterStates.getPatternList(), p => <MenuItem
      type='checkbox'
      key={p}
      onClick={() => handlePattern(p)}
      checked={p === itemFilterStates.pattern}
      >{p}</MenuItem>)}
    <MenuDivider/>
    <MenuHeader>Filters</MenuHeader>
    <MenuDivider/>
    {_.map(itemFilterStates.getFilterMap(), (v, f) =><MenuItem
      type='checkbox'
      key={f === '' ? '<BLANK>' : f}
      onClick={() => handleFilter(f)}
      checked={itemFilterStates.isSet(f)}
    >{f === '' ? '<BLANK>' : f}</MenuItem>)}
  </Menu>
}
