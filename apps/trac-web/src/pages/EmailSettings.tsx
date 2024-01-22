import FileSelectButton from "../components/FileSelectButton";
import React, {useState} from "react";
import {MdOutlineUpload} from "react-icons/md";
import {NullableString} from "@trac/datatypes";
import {useMutation} from "@tanstack/react-query";
import {postEmailTemplate, UploadTemplateType} from "../api/emailApi";
import {EmailSettingsForm} from "../components/email/EmailSettingsForm";
import {HiOutlineSwitchHorizontal} from "react-icons/hi";

export const EmailSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [templateType, setTemplateType] = useState('Expired');
  const disableButton = uploadFile === null || isLoading;
  const submitMutation = useMutation({
    mutationFn: async (formData: UploadTemplateType) => {
      setIsLoading(true);
      return postEmailTemplate(formData);
    },
    onError: (error: NullableString, variables, context) => {
      if (error) {
        console.error('no upload file is specified', error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
    }
  })
  const handleSubmit = event => {
    // console.log('submit event', fileType, uploadFile);
    event.preventDefault();
    if (uploadFile) {
      const formData: UploadTemplateType = {
        file: uploadFile,
        emailTemplateType: templateType,
      };
      submitMutation.mutate(formData);
    }
  }
  const handleFile = file => {
    setUploadFile(file);
    console.log('upload file set to ', uploadFile);
  }
  const handleClick = () => {
    const newValue = templateType === 'Expired' ? 'Missing' : 'Expired';
    setTemplateType(newValue);
  }
  return <div className='flex flex-col divide-y-4 divide-bl-consumer-dark gap-4'>
    <div className='flex'>
      <button className='button bg-bl-consumer-second px-2'
              onClick={handleClick}>
        <HiOutlineSwitchHorizontal/>{templateType}
      </button>
      <div className='flex justify-start border-2 border-bl-consumer-off-white'>
        <FileSelectButton
          name="Upload"
          accepts='.docx'
          label=""
          returnFile={handleFile}
          disabled={false}
        />
      </div>
      <div className='flex justify-end'>
        <button
          disabled={disableButton}
          onClick={handleSubmit}
          className={`${disableButton ? 'button-disabled'
            : 'button-enabled'} button`}
        ><MdOutlineUpload/>{isLoading ? 'Loading' : 'Upload'}
        </button>
      </div>
    </div>
    <EmailSettingsForm templateType={templateType}/>
    {/*<EmailPreview templateType={templateType} accountId={idFromParams}/>*/}
  </div>
}
