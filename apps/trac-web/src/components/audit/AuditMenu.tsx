import {Menu, MenuButton, MenuDivider, MenuItem} from "@szhsin/react-menu";

export const AuditMenu = ({
                            notesState,
                            setNotesDisplay,
                            addAuditNote,
                            statusChange,
                            auditStatus,
                            removeAudit,
                            sendAudit,
                            sendAuditEnabled,
                          }) => {
  // console.log('notes state', notesState);
  const handleDisplay = d => {
    notesState.setDisplay(d);
    notesState.selectItemNote();
    setNotesDisplay(notesState.display);
  }
  // console.log(`auditStatus ${auditStatus} open ${auditStatus === 'OPEN'} close ${auditStatus === 'CLOSED'}`);
  return <Menu
    menuButton={<MenuButton className='align-bottom h-1/3 py-2 px-3 bg-bl-consumer-second'>Actions</MenuButton>}>
    <MenuItem hidden={notesState.display === 'All' && notesState.itemUuid === null}
              onClick={e => handleDisplay('All')}>
      Show All Notes</MenuItem>
    <MenuItem hidden={notesState.display === 'Audit'} disabled={!notesState.hasAuditNotes()}
              onClick={e => handleDisplay('Audit')}>
      Show Audit Notes</MenuItem>
    <MenuItem hidden={notesState.display === 'Hide'} onClick={e => handleDisplay('Hide')}>
      Hide Notes</MenuItem>
    <MenuDivider/>
    <MenuItem disabled={auditStatus === 'CLOSED'} onClick={addAuditNote}>Add Note</MenuItem>
    <MenuDivider/>
    <MenuItem disabled={auditStatus !== 'CHECKIN'} onClick={() => statusChange('OPEN')}>Convert Checkin To
      Audit</MenuItem>
    <MenuItem disabled={auditStatus !== 'OPEN'} onClick={() => statusChange('CHECKIN')}>Downgrade Audit to
      Checkin</MenuItem>
    <MenuItem disabled={auditStatus !== 'CHECKIN'} onClick={removeAudit}>Remove Checkin</MenuItem>
    <MenuItem disabled={auditStatus !== 'OPEN'} onClick={() => statusChange('CLOSED')}>Close Audit</MenuItem>
    <MenuItem disabled={auditStatus !== 'CLOSED'} onClick={() => statusChange('OPEN')}>Re-Open Audit</MenuItem>
    <MenuDivider/>
    <MenuItem onClick={sendAudit}>Send Audit</MenuItem>
    {/*<MenuItem disabled={sendAuditEnabled} onClick={sendAudit}>Send Audit</MenuItem>*/}
  </Menu>
}
