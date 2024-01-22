import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {useNavigate, useParams} from "react-router";
import useWebSocket from "react-use-websocket";
import PagesMap from "../navigation/PagesMap";
import {Outlet} from "react-router-dom";
import {MdOutlineCancel, MdOutlinePublishedWithChanges} from "react-icons/md";
import {connectionStatus, DataUploadTypes, notifyPaths, NullableString, UploadSessionToken} from "@trac/datatypes";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {postCancel, postCommit} from "../api/uploadApi";
import {useTracContext} from "../TracContext";
import {wsRoot} from "../httpConfig";
import {UploadStatus} from "../components/upload/UploadStatus";

const pagesMap = new PagesMap();
const DataUpload = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {session: sessionFromParams, upload_filetype} = useParams();
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  const {getTracContext, setTracContext} = useTracContext();
  const uploadSession = getTracContext('uploadSession') as UploadSessionToken || null;
  const session = sessionFromParams || null;
  const uploadFileType = (upload_filetype || null) as (DataUploadTypes | null);
  // console.log(`websocket URL ${wsRoot}${notifyPaths['iolUpload']}`);

  const {lastMessage, readyState } = useWebSocket(`${wsRoot}${notifyPaths['iolUpload']}`,
    {share: true, retryOnError: true});
  console.log('websocket returned data', connectionStatus[readyState], lastMessage)
  const cancelMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postCancel(session, uploadFileType);
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      setTracContext('uploadSession', null);
      queryClient.invalidateQueries();
    },
    onError: (error:NullableString, variables, context) => {
      if(error) {
        setError(error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
      navigate(`/${pagesMap.page('Data Upload')}`, {replace: true});
    }
  })
  const commitMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postCommit(session, uploadFileType);
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      setTracContext('uploadSession', null);
    },
    onError: (error:NullableString, variables, context) => {
      if(error) {
        setError(error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
      queryClient.removeQueries({queryKey:['data history']})
      navigate(`/${pagesMap.page('Data Upload')}`);
    }
  })
  useEffect(() => {
  //   console.log(`sessions and file types
  // from parameters ${session} ${upload_filetype}
  // from redux "${uploadSession?.session}" "${uploadSession?.type}"`);
    // After submitting an upload, the session and filetype shows up in the context instead of the parameters.
    if ((!_.isString(session)) && uploadSession &&
      _.isString(uploadSession.session) && _.isString(uploadSession.type)) {
      // console.log('navigating to Analytics');
      navigate(pagesMap.page('Analytics', [uploadSession.type, uploadSession.session]))
    }

  }, [uploadSession]);
  const handleCancel = async () => {
    if (session && uploadFileType) {
      cancelMutation.mutate();
    }
  }

  const handleCommit = async () => {
    if (session && upload_filetype) {
      commitMutation.mutate();
    }
  }
  console.log(`For the button bar ${session} and ${upload_filetype}`);
  const buttonBar = session && upload_filetype &&
    <div className='flex gap-4 items-center'>
      <button
        onClick={handleCancel}
        className='button button-enabled-outlined'
      ><MdOutlineCancel/>Cancel
      </button>
      <button
        onClick={handleCommit}
        className={`${isLoading ? 'button-disabled' : 'button-enabled'} button`}>
        <MdOutlinePublishedWithChanges/>{isLoading ? 'Committing' : 'Commit'}
      </button>
    </div>;
  const errorMessage = error && <div><h4>Network Error</h4></div>;
  const loadingMessage = isLoading && <UploadStatus
    readyStatus={readyState}
    message={lastMessage}/>

  return <div>
    {buttonBar}
    {loadingMessage}
    {errorMessage}
    <Outlet/>
  </div>;
}
export default DataUpload;
