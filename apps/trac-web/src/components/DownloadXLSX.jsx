import React, {useContext} from 'react';
import {TracContext} from "../TracContext";
import {MdGetApp} from "react-icons/md";
// import { Link, withRouter } from 'react-router-dom';
/*
const createAndDownloadXLSX = async () => {
    const fetched = await fetch('/download'); // add query or query ref to call.
    console.log(fetched);
};
 */
// location: {pathname, search, hash, state, key}
const DownloadXLSX = ({queryId, style = {}, className = '', buttonText = 'Download', type = 'trac', filters}) => {
  // console.log(`download xlsx: http://${window.location.host}/download?queryId=${queryId}&type=${type}${filters ? `&filters=${JSON.stringify(filters)}`: ''}`);
  const appState = useContext(TracContext);
  const {serverPort} = appState;
  return (
    <a style={{textDecoration: 'none', ...style}} className={className}
       href={`http://${window.location.hostname}:${serverPort}/download?queryId=${queryId}&type=${type}${filters ? `&filters=${JSON.stringify(filters)}` : ''}`}
       target='_blank' rel='noopener noreferrer' download>
      <button
        endIcon={<MdGetApp/>}
        size='small'
      >
        {buttonText}
      </button>
    </a>
  );
};

export default DownloadXLSX;
