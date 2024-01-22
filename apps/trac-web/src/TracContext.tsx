import React, {createContext, useContext, useState} from 'react';
import {AuditLocationRecord, CustomerRecord, NullableString, SalesRepRecord, UploadSessionToken} from "@trac/datatypes";
import {NotesPanelControls} from "./components/notes/NotesPanelState";

export type FilterNames = ('customers' |
  'consignments' |
  'products' |
  'customerContacts' |
  'premium' |
  'standard');
export type FilterMap = {[id: string]: boolean};
export interface SearchSpecifications {
  text: NullableString;
  filters: FilterMap;
}
export type ContextSlices = (
  'appUser' |
  'customerAccount' |
  'auditSummary' |
  'salesRep' |
  'filterButtons' |
  'itemFilter' |
  'search' |
  'notesPanelControls' |
  'uploadSession');
export interface TracContextType {
  activePage: string;
  appUser?: string;
  serverPort?: number;
  customerAccount: (CustomerRecord | null);
  auditSummary: (AuditLocationRecord | null);
  salesRep: (SalesRepRecord | null);
  uploadSession: (UploadSessionToken | null)
  notification: string;
  showDialog: boolean;
  search: SearchSpecifications;
  filterButtons: FilterMap;
  notesPanelControls: NotesPanelControls;
}

const initialContextState : TracContextType = {
  notesPanelControls: {display:'Hide', itemUuid: null},
  activePage: 'home',
  notification: '',
  showDialog: false,
  customerAccount: null,
  auditSummary: null,
  salesRep: null,
  uploadSession: null,
  filterButtons: {},
  search: {text: null, filters: {}}
};
let setTracContext = (key: ContextSlices, value) => console.log(`context not initialized ${key} = ${value}`);
const TracContext = createContext({tracState: initialContextState, setTracContext});

const TracContextProvider = ({children}) => {
  const [tracState, setTracState] = useState(initialContextState);
  // console.log('incoming TRAC state', tracState);
  setTracContext = (key, value) => {
    const newState = {
      ...tracState,
    };
    newState[key] = value;
    // console.log(`Setting TRAC context ${key}`, value, newState, tracState);
    setTracState(newState);
  }

  return (
    <TracContext.Provider value={{tracState, setTracContext}}>
      <>{children}</>
    </TracContext.Provider>
  );
}
const useTracContext = () => {
  const {tracState, setTracContext} = useContext(TracContext);
  const getTracContext = (key: ContextSlices) => {
    return tracState[key] || null;
  }
  return {getTracContext, setTracContext}
}
export {TracContext, TracContextProvider, useTracContext};
