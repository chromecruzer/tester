import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import {useNavigate, useParams} from "react-router";
import PagesMap from "../navigation/PagesMap";
import {MdOutlineCancel, MdOutlinePublishedWithChanges} from "react-icons/md";
import {NullableString, UploadSessionToken} from "@trac/datatypes";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {getUploadHistory, postCancel, postCommit} from "../api/uploadApi";
import {useTracContext} from "../TracContext";
import {getAuditLocations} from "../api/auditApi";
import {AuditScanUploadTable} from "../components/audit/AuditScanUploadTable";
import {AuditUploadSubmit} from "../components/audit/AuditUploadSubmit";

const pagesMap = new PagesMap();
const AuditUpload = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {session: sessionFromParams} = useParams();
  const session = sessionFromParams || null;
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  const {getTracContext, setTracContext} = useTracContext();
  const uploadSession = getTracContext('uploadSession') as UploadSessionToken || null;

  const cancelMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postCancel(session, 'audit_scans');
    },
    onSuccess: (data, variables, context) => {
      console.log('audit upload executing on success');
      setError(null);
      setTracContext('uploadSession', null);
      queryClient.invalidateQueries();
      queryClient.prefetchQuery(['audit locations'], () => getAuditLocations({status: null}));
    },
    onError: (error:NullableString, variables, context) => {
      if(error) {
        setError(error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
      console.log('audit upload executing on settled');
      setTracContext('uploadSession', null);
      queryClient.invalidateQueries({queryKey: ['audit locations']})
      queryClient.prefetchQuery(['audit locations'], () => getAuditLocations({status: null}));
      navigate(`/${pagesMap.page('Audit Upload')}`, {replace: true});
    }
  })
  const commitMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postCommit(session, 'audit_scans');
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
      queryClient.removeQueries({queryKey:['details', session]})
      navigate(`/${pagesMap.page('Audit Upload')}`);
    }
  })
  useEffect(() => {
    console.log(`sessions and file types
  from parameters ${session}
  from query "${uploadSession?.session}" "${uploadSession?.type}"`);
    // After submitting an upload, the session and filetype shows up in the context instead of the parameters.
    if ((!_.isString(session)) && uploadSession &&
      _.isString(uploadSession.session) && _.isString(uploadSession.type)) {
      // console.log('navigating to Analytics');
      navigate(pagesMap.page('Analytics', [uploadSession.type, uploadSession.session]))
    }

  }, [uploadSession]);
  const handleCancel = async () => {
    if (session) {
      cancelMutation.mutate();
    }
  }
  const handleCommit = async () => {
    if (session) {
      commitMutation.mutate();
    }
  }
  const audit = session ?
    <>
      <div className='flex gap-4 items-center'>
        <button
          onClick={handleCancel}
          className='button button-enabled-outlined'
        ><MdOutlineCancel/>Cancel
        </button>
        <button
          onClick={handleCommit}
          className='button button-enabled'
        ><MdOutlinePublishedWithChanges/>Commit
        </button>
      </div>
      <AuditScanUploadTable session={session}/>
    </> :
    <AuditUploadSubmit/>;
  const errorMessage = error && <div><h4>Network Error</h4></div>;
  const loadingMessage = isLoading &&
    <h4>Processing...</h4>

  return <div>
    {loadingMessage}
    {errorMessage}
    {audit}
  </div>;
}
export default AuditUpload;
