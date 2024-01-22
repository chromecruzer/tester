import React, {useState} from "react";
import {
  connectionStatus,
  notifyPaths,
  NullableString,
  supportedUploadFiles,
  UploadSupportedFileTypes
} from "@trac/datatypes";
import {MdOutlineUpload} from "react-icons/md";
import FileSelectButton from "../FileSelectButton";
import {useTracContext} from "../../TracContext";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {postSubmit, UploadFormData} from "../../api/uploadApi";
import PagesMap from "../../navigation/PagesMap";
import {useNavigate} from "react-router";
import {DataUploadHistory} from "./DataUploadHistory";
import useWebSocket from "react-use-websocket";
import {wsRoot} from "../../httpConfig";
import {UploadStatus} from "./UploadStatus";

const dump = obj => JSON.stringify(obj, null, 2);

const pagesMap = new PagesMap();
export const UploadSubmit = () => {
  const navigate = useNavigate();
  const {getTracContext, setTracContext} = useTracContext();
  const [fileType, setFileType] = useState('iol_report');
  const [uploadFile, setUploadFile] = useState(null);
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const {readyState, lastMessage} = useWebSocket(`${wsRoot}${notifyPaths['iolUpload']}`,
    {share: true, retryOnError: true});
  console.log('websocket returned data', lastMessage)
  const submitMutation = useMutation({
    mutationFn: async (formData: UploadFormData) => {
      setIsLoading(true);
      setError(null);
      const response = await postSubmit(formData);
      return response;
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      queryClient.setQueryData(['analytics'], data.analytics)
      setTracContext('uploadSession', {session: data.session, type: data.upload_filetype});
      navigate(pagesMap.page('Analytics', [data.upload_filetype, data.session]))
    },
    onError: (error: NullableString, variables, context) => {
      if (error) {
        setError(error);
        console.error('no upload file is specified', error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
    }
  })
  // console.log(`upload file ${dump(uploadFile)}`);
  const handleFileTypeChange = event => {

    setFileType(event.target.value);
    console.log('filetype use state', fileType, event);
  };
  const handleFile = file => {
    setUploadFile(file);
    console.log('upload file set to ', uploadFile);
  }
  const handleSubmit = event => {
    // console.log('submit event', fileType, uploadFile);
    event.preventDefault();
    if (uploadFile) {
      const formData: UploadFormData = {
        file: uploadFile,
        user: (getTracContext('appUser') as string || 'unknown'),
        type: fileType as UploadSupportedFileTypes
      };
      submitMutation.mutate(formData);
    }
  }
  const disableButton = uploadFile === null || isLoading;
  const errorMessage = error && <div><h4>Network Error</h4></div>;
  const loadingMessage = isLoading && <UploadStatus
    readyStatus={readyState}
    message={lastMessage}/>

  return <div className='flex-row'>
    <div className='flex justify-start border-2 border-bl-consumer-off-white'>
      <FileSelectButton
        name="Upload"
        label="File to DataUpload"
        returnFile={handleFile}
        disabled={false}
      />
      <select
        value={fileType}
        onChange={handleFileTypeChange}
        className='py-2 px-3 uppercase cursor-pointer bg-bl-text-light text-bl-text-grey'
      >
        {supportedUploadFiles().map(k => (<option key={k}>{k}</option>))}
      </select>
    </div>
    <div className='flex justify-start border-2 border-bl-consumer-off-white'>
      <button
        disabled={disableButton}
        onClick={handleSubmit}
        className={`${disableButton ? 'button-disabled'
          : 'button-enabled'} button`}
      ><MdOutlineUpload/>{isLoading ? 'Loading' : 'Upload'}
      </button>
      {loadingMessage}
    </div>
    <DataUploadHistory/>
    {errorMessage}
  </div>;
}


