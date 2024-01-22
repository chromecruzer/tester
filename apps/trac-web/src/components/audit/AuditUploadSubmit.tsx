import React, {useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import {dataTableNames, NullableString, tracDateFormat,} from "@trac/datatypes";
import {MdOutlineClear, MdOutlineUpload} from "react-icons/md";
import FileSelectButton from "../FileSelectButton";
import {useTracContext} from "../../TracContext";
import {DateTime} from "luxon";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {postSubmit, UploadFormData} from "../../api/uploadApi";
import PagesMap from "../../navigation/PagesMap";
import {useNavigate} from "react-router";
import {SearchWithAutoComplete} from "../search/SearchWithAutoComplete";

export interface AuditFormData extends UploadFormData {
  scanner: string;
  scanDate: Date;
  locationCode: (string | null);
  is_audit: boolean;
}

const dump = obj => JSON.stringify(obj, null, 2);

export const initialAuditFormData: AuditFormData = {
  file: null,
  user: 'unknown',
  type: 'audit_scans',
  scanner: '',
  scanDate: DateTime.now().toJSDate(),
  locationCode: null,
  is_audit: false,
};


const pagesMap = new PagesMap();
export const AuditUploadSubmit = () => {
  const navigate = useNavigate();
  const {getTracContext, setTracContext} = useTracContext();
  const [form, setForm] = useState(initialAuditFormData);
  const [locationChosen, setLocationChosen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const submitMutation = useMutation({
    mutationFn: async (formData: UploadFormData) => {
      setIsLoading(true);
      setError(null);
      return postSubmit(formData);
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      queryClient.setQueryData(['audit'], data.analytics)
      setTracContext('uploadSession', {session: data.session, type: data.upload_filetype});
      navigate(`/${pagesMap.page('Audit Upload Session', [data.session])}`)
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
  // console.log('upload form', auditFormData)
  // console.log(`upload file ${dump(uploadFile)}`);
  useEffect(() => {
    const filters = {};
    filters[dataTableNames.customers] = true;
    setTracContext('search', {filters})
  }, []);

  const choose = (choice) => {
    console.log('returned match', choice);
    const code = choice.field == null ? choice.suggestion.signature.customer_code : choice.field;
    const update = {...form, locationCode: code};
    setForm(update);
    setLocationChosen(true);
  };
  const setDate = date => {
    const update = {...form, scanDate: date};
    // console.log(`updated form of a date ${dump(update)}`)
    setForm(update);
  }
  const setScanner = e => {
    const update = {...form, scanner: e.target.value};
    setForm(update);
  }
  const setIsAudit = e => {
    const update = {...form, is_audit: !form.is_audit};
    setForm(update);
  }
  const location = locationChosen ?
    <div className='flex justify-start items-start border-2 border-bl-consumer-off-white'>
      <h4 className='py-2 px-3'>Account</h4>
      <div className='flex border-2 hover: border-lime-500'>
        <span className='py-2 px-3 text-bl-text-grey'>{form.locationCode}</span>
        <button onClick={() => setLocationChosen(false)}><MdOutlineClear/></button>
      </div>
    </div> :
    <SearchWithAutoComplete
      setChosen={choose}
    >
    </SearchWithAutoComplete>;
  const handleFile = file => {
    setUploadFile(file);
    // console.log('upload file set to ', uploadFile);
  }
  const handleSubmit = event => {
    // console.log('submit event', fileType, uploadFile);
    event.preventDefault();
    if (uploadFile) {
      const formData: UploadFormData = {
        file: uploadFile,
        user: (getTracContext('appUser') as string || 'unknown'),
        type: 'audit_scans',
        scanner: form.scanner,
        scan_date: DateTime.fromJSDate(form.scanDate).toFormat(tracDateFormat),
        location_code: form.locationCode || undefined,
        is_audit: form.is_audit,
      }
      submitMutation.mutate(formData);
    }
  }
  const disableButton = uploadFile === null || isLoading;
  const errorMessage = error && <div><h4>Network Error</h4></div>;
  return <div className='flex-row'>
    <div className='flex justify-start border-2 border-bl-consumer-off-white'>
      <FileSelectButton
        name="Upload"
        label="File to Upload"
        returnFile={handleFile}
        disabled={false}
      />
    </div>
    <div className='flex justify-s items-start'>
      {location}
      <div className='flex'>
        <h4 className='py-2 px-3'>Scanner</h4>
        <input
          type='text'
          value={form.scanner || ''}
          onChange={setScanner}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <div className='flex'>
        <h4 className='py-2 px-3'>Scan Date</h4>
        <DatePicker
          selected={form.scanDate}
          onChange={setDate}
          className='border-2 border-bl-consumer-off-white'
        />
      </div>
      <button className='border-2 border-bl-consumer-dark bg-bl-consumer-second p-1' onClick={setIsAudit}>
        {form.is_audit ? 'Upload As Audit' : 'Upload As Checkin'}</button>
    </div>
    <button
      disabled={disableButton}
      onClick={handleSubmit}
      className={`${disableButton ? 'button-disabled'
        : 'button-enabled'} button`}>
      <MdOutlineUpload/>{isLoading ? 'Loading' : 'Upload'}
    </button>
    {errorMessage}
  </div>;
}


