import {ControlledMenu, MenuItem, useMenuState} from "@szhsin/react-menu";
import {useState} from "react";
import '@szhsin/react-menu/dist/core.css';
interface Point {
  x: number;
  y: number;
}
export const AuditContextMenu = ({children, addNoteAction, changeStatusAction, auditStatus}) => {
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
      <MenuItem disabled={auditStatus === 'CLOSED'} onClick={addNoteAction}>Add Note</MenuItem>
      <MenuItem disabled={auditStatus === 'CLOSED'} onClick={changeStatusAction}>Change Status</MenuItem>
    </ControlledMenu>
    {children}
  </div>
}
