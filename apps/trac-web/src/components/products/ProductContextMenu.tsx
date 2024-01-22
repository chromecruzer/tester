import {ControlledMenu, MenuItem, useMenuState} from "@szhsin/react-menu";
import {useState} from "react";
import '@szhsin/react-menu/dist/core.css';
interface Point {
  x: number;
  y: number;
}
export const ProductContextMenu = ({children, changePriceAction, setExclude}) => {
  const [menuProps, toggleMenu] = useMenuState();
  const [anchor, setAnchor] = useState({x:0, y:0} as Point);
  const handleContextMenu = e => {
    e.preventDefault();
    setAnchor(({x:e.clientX, y:e.clientY}));
    toggleMenu(true);
  }
  return <div onContextMenu={handleContextMenu}>
    <ControlledMenu {...menuProps} anchorPoint={anchor}
                                   onClose={() => toggleMenu(false)}>
      <MenuItem onClick={changePriceAction}>Change Price</MenuItem>
      <MenuItem onClick={() => setExclude(true)}>Exclude</MenuItem>
      <MenuItem onClick={() => setExclude(false)}>Do Not Exclude</MenuItem>
    </ControlledMenu>
    {children}
  </div>
}
