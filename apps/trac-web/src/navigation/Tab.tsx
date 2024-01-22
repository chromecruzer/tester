import _ from "lodash";
import React from "react";
import {NavLink} from "react-router-dom";
import PagesMap from "./PagesMap";
import {NullableString} from "@trac/datatypes";
const pageMap = new PagesMap();
export const Tab = ({name, icon, navigation = null as NullableString, isDisabled = false}) => {
  // console.log(`tab ${name} is navigating to ${pageMap.page(name)}`);
  return <NavLink
    className={({isActive}) => isActive ? 'tab tab-active':
  isDisabled ? 'tab tab-disabled' :
    'tab tab-normal'}
    to={pageMap.page(navigation || name)}>
    <span className='p-1 inline-block'>{icon}</span>
    {name}
  </NavLink>
}
