import React, {useState} from "react";
import {useLocation} from "react-router-dom";
import {MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight} from "react-icons/md";
import PagesMap from "./PagesMap";

const pageMap = new PagesMap();
export const TabContainer = ({children, name, icon, navigation}) => {
  const {pathname} = useLocation();
  const parent = pageMap.activeParent(pathname);
  // console.log(`parent ${parent} compared to navigation ${navigation} for ${pathname}`);
  const [isExpanded, setIsExpanded] = useState(false);
  if((parent === navigation) && !isExpanded) {
    setIsExpanded(true);
  }
  const childClasses = isExpanded ? 'tab-container' : 'hidden';
  const caret = isExpanded ? <MdOutlineKeyboardArrowDown/> : <MdOutlineKeyboardArrowRight/>
  // console.log(`${name} is expanded ${isExpanded}`);
  const handleExpandCollapse = () => {
    // console.log(`${name} setting isExpanded from ${isExpanded}`)
    setIsExpanded(!isExpanded);
  };
  return <div className='tab-container'>
    <button
      className={(parent === navigation) ? 'tab tab-active':
          'tab tab-normal'}
      onClick={handleExpandCollapse}>
      <span className='p-1 inline-block'>{icon}</span>
      {name}
      <span className='p-1 inline-block'>{caret}</span>
    </button>
    <ul className={`${childClasses} ml-4`}>
      {children}
    </ul>
  </div>
}
