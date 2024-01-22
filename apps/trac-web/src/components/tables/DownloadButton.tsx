import {useState} from "react";
import {MdOutlineDownload} from "react-icons/md";
import {Menu, MenuButton, MenuItem} from "@szhsin/react-menu";
import {
  DownloadType,
  postDownloadAuditSpreadsheet,
  postDownloadPdf,
  postDownloadSpreadsheet
} from "../../api/downloadApi";
import {useMutation} from "@tanstack/react-query";
import {NullableString} from "@trac/datatypes";
import NotesMapping from "../notes/NotesMapping";


export const DownloadButton = ({
                                 headers = null as (any[] | null),
                                 data,
                                 notesMappings = null as (NotesMapping | null),
                                 pdfDate = null as (null | string),
                                 customerId = null as (string | null),
                                 auditUuid = null as (string | null),
                                 pdfDataFilter = data => data,
                                 downloadType = 'spreadsheet' as DownloadType,
                               }) => {
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  // console.log('download data', data);
  const pdfData = pdfDataFilter(data);
  // console.log('download filtered data', pdfData);
  const spreadsheetSuccess = (data) => {
    setError(null);
    const url = window.URL.createObjectURL(data.blob as Blob);
    const link = document.createElement('a');
    console.log('link', url, data.blob);
    link.href = url;
    link.setAttribute('download', data.filename); //or any other extension
    document.body.appendChild(link);
    link.click();
    console.log('link clicked', link);
  };
  const spreadsheetMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postDownloadSpreadsheet(headers, data);
    },
    onSuccess: spreadsheetSuccess,
    onError: (error: NullableString, variables, context) => {
      if (error) {
        setError(error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
    }
  })
  const auditSpreadsheetMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postDownloadAuditSpreadsheet(headers, notesMappings);
    },
    onSuccess: spreadsheetSuccess,
    onError: (error: NullableString, variables, context) => {
      if (error) {
        setError(error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
    }
  })
  const pdfMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      return postDownloadPdf(customerId, auditUuid, pdfDate, pdfData, downloadType);
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      const url = window.URL.createObjectURL(data.blob as Blob);
      const link = document.createElement('a');
      console.log('link', url, data.blob);
      link.href = url;
      link.setAttribute('download', data.filename); //or any other extension
      document.body.appendChild(link);
      link.click();
      console.log('link clicked', link);
    },
    onError: (error: NullableString, variables, context) => {
      if (error) {
        setError(error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
    }
  })
  const handleClick = (type: DownloadType) => {
    switch(true) {
      case type === 'spreadsheet' && notesMappings === null:
        console.log(`creating spreadsheet from ${type}`, notesMappings)
        spreadsheetMutation.mutate();
        break;
      case type === 'spreadsheet' && notesMappings !== null:
        console.log(`creating audit spreadsheet from ${type}`, notesMappings)
        auditSpreadsheetMutation.mutate();
        break;
      default:
        console.log(`creating pdf from ${type}`, notesMappings)
        pdfMutation.mutate();
    }
  }

  return downloadType !== 'spreadsheet' ?
    <Menu menuButton={<MenuButton className='button-enabled button'><MdOutlineDownload/></MenuButton>}>
      <MenuItem onClick={e => handleClick('spreadsheet')}>Spreadsheet</MenuItem>
      <MenuItem disabled={pdfData.length === 0}
                onClick={e => handleClick(downloadType as unknown as DownloadType)}>PDF</MenuItem>
    </Menu> :
    <button onClick={e => handleClick('spreadsheet')} className='button-enabled button'>
      <MdOutlineDownload/></button>
}

