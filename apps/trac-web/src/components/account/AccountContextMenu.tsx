import {ControlledMenu, MenuItem, useMenuState} from "@szhsin/react-menu";
import {useState} from "react";

interface Point {
  x: number;
  y: number;
}
export const AccountContextMenu = ({sendBatch, sendIsReady, children}) => {
  const [menuProps, toggleMenu] = useMenuState();
  const [anchor, setAnchor] = useState({x:0, y:0} as Point);
  // console.log(`auditStatus ${auditStatus}`);
  const handleContextMenu = e => {
    e.preventDefault();
    setAnchor(({x:e.clientX, y:e.clientY}));
    toggleMenu(true);
  }
  return <div onContextMenu={handleContextMenu}>
    <ControlledMenu {...menuProps} anchorPoint={anchor}
                    onClose={() => toggleMenu(false)}>
      <MenuItem disabled={!sendIsReady} onClick={sendBatch}>Send Expired Emails</MenuItem>
    </ControlledMenu>
    {children}
  </div>

}
