import {useState} from "react";
import {DialogModal} from "../tables/DialogModal";
import {dateNow, formatTracDate, NullableString} from "@trac/datatypes";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {getAudit, postAuditNotes} from "../../api/auditApi";

export const AddAuditNoteDialog = ({author, location, open, requestClose, auditUuid}) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState(null as NullableString);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const postAuditNotesMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      handleClose();
      return postAuditNotes([{
        date_created: formatTracDate(dateNow()),
        author,
        annotate_type: 'Audit',
        annotated_uuid: location.uuid,
        audit_uuid: location.uuid,
        content: note,
      }]);
    },
    onSuccess: (data, variables, context) => {
      setError(null);
      queryClient.prefetchQuery(['audit'], () => getAudit(auditUuid));
    },
    onError: (error:NullableString, variables, context) => {
      if(error) {
        setError(error);
        console.error('post audit notes',error);
      }
    },
    onSettled: (data, error, variables, context) => {
      setIsLoading(false);
    }
  })
  const handleClose = () => {
    setNote('');
    requestClose();
  }
  const handleChange = e => {
    setNote(e.target.value);
  }
  const handleSubmit = () => {
    postAuditNotesMutation.mutate();
  }
  return <DialogModal open={open} requestClose={handleClose}>
    <div className='flex-col min-h-full min-w-full justify-items-stretch'>
      <h2 className='px-2 py-2 text-center font-bold text-bl-text-dark'>Add A Note To The Audit</h2>
      <textarea
        value={note}
        rows={12}
        placeholder='Type your note here'
        onChange={handleChange}
        className='border-2 px-2 py-2 grow justify-self-stretch self-stretch min-h-0 min-w-0 w-full h-full'
      />
      <div className='flex-row content-between'>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={() => handleClose()}>Cancel</button>
        <button className='border-2 px-2 py-2 filter-button-active' onClick={handleSubmit}>Ok</button>
      </div>
    </div>
  </DialogModal>
}
