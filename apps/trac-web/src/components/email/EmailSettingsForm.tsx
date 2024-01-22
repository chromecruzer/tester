import React, {useEffect, useState} from "react";
import {initialEmailSettings, NullableString} from "@trac/datatypes";
import {BsArrowUpSquare} from "react-icons/bs";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getEmailSettings, postEmailSettings} from "../../api/emailApi";
import {RxCaretDown, RxCaretUp} from "react-icons/rx";

export const EmailSettingsForm = ({templateType}) => {
  const [form, setForm] = useState(initialEmailSettings);
  const [disableButton, setDisableButton] = useState(true);
  const [advanced, setAdvanced] = useState(false);
  const queryClient = useQueryClient();
  const {
    data: settings,
  } = useQuery({
    queryKey: ['email settings'],
    queryFn: () => getEmailSettings(),
    select: data => {
      console.log('settings data', data);
      return data;
    },
  });
  useEffect(() => {
    // console.log('settings data', settings);
    if (settings) {
      setForm(settings)
    }
  }, [settings]);
  const postEmailSettingsMutation = useMutation({
    mutationFn: async () => {
      return postEmailSettings(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setDisableButton(true);
    },
    onError: (error: NullableString) => {
      if (error) {
        console.error('post email settings', error);
      }
    },
  });
  const getField = field => {
    // console.log(`getting from form`, form);
    switch (field) {
      case 'subject':
      case 'sender':
      case 'attachmentTableName':
        return form[(templateType === 'Expired' ? 'expiredHeader' : 'missingHeader')][field];
      case 'batchSize':
      case 'delayInSeconds':
      case 'disableExpireEmails':
        return form.server[field];
      default:
        return form[field];
    }
  }
  const setFormField = (e, field) => {
    const update = {...form};
    const setField = (field, val) => {
      switch (field) {
        case 'subject':
        case 'sender':
        case 'attachmentTableName':
          update[(templateType === 'Expired' ? 'expiredHeader' : 'missingHeader')][field] = val;
          break;
        case 'batchSize':
        case 'delayInSeconds':
          update.server[field] = val;
          break;
        case 'disableExpireEmails':
          update.server.disableExpireEmails = !update.server.disableExpireEmails;
          break;
        case 'ccSTM':
        case 'ccPDM':
        case 'ccKAE':
          // console.log(`set boolean ${field} = ${update[field]}`);
          update[field] = !update[field];
          break;
        default:
          update[field] = val;
      }
    }
    setField(field, e.target.value);
    // console.log('set form updated', update);
    setForm(update);
    setDisableButton(false);
  }

  const handleSet = () => {
    postEmailSettingsMutation.mutate();
  }
  const advancedSettings = advanced &&
    <div className='flex flex-col border-y-4 border-bl-consumer-dark gap-4'>
      <div className='flex'>
        <h4 className='py-2 px-3'>Batch Size: </h4>
        <input
          type='number'
          value={getField('batchSize') || 1}
          onChange={e => setFormField(e, 'batchSize')}
          className='py-2 px-3 cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <div className='flex'>
        <h4 className='py-2 px-3'>Delay Between Batches(seconds): </h4>
        <input
          type='number'
          value={getField('delayInSeconds') || 1}
          onChange={e => setFormField(e, 'delayInSeconds')}
          className='py-2 px-3 cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <div className='flex'>
        <h4 className='py-2 px-3'>Disable Expire Emails: </h4>
        <input
          type='checkbox'
          checked={getField('disableExpireEmails')}
          onChange={e => setFormField(e, 'disableExpireEmails')}
          className='py-2 px-3 cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
    </div>

  return <div className='flex-row'>
    <div className='flex-row'>
      <div className='flex'>
        <h4 className='py-2 px-3'>Sender: </h4>
        <input
          type='text'
          value={getField('sender') || ''}
          onChange={e => setFormField(e, 'sender')}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <div className='flex'>
        <h4 className='py-2 px-3'>Subject: </h4>
        <input
          type='text'
          value={getField('subject') || ''}
          onChange={e => setFormField(e, 'subject')}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <div className='flex'>
        <h4 className='py-2 px-3'>Table Name: </h4>
        <input
          type='text'
          value={getField('attachmentTableName') || ''}
          onChange={e => setFormField(e, 'attachmentTableName')}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <div className='flex-row'>
        <div className='flex'>
          <h4 className='py-2 px-3'>Send Copy To Sales Territory Manager: </h4>
          <input
            type='checkbox'
            checked={getField('ccSTM')}
            onChange={e => setFormField(e, 'ccSTM')}
            className='py-2 px-3 cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
          />
        </div>
        <div className='flex'>
          <h4 className='py-2 px-3'>Send Copy To Product Design Manager: </h4>
          <input
            type='checkbox'
            checked={getField('ccPDM')}
            onChange={e => setFormField(e, 'ccPDM')}
            className='py-2 px-3 cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
          />
        </div>
        <div className='flex'>
          <h4 className='py-2 px-3'>Send Copy To Key Account Executive: </h4>
          <input
            type='checkbox'
            checked={getField('ccKAE')}
            onChange={e => setFormField(e, 'ccKAE')}
            className='py-2 px-3 cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
          />
        </div>
        <button
          onClick={() => setAdvanced(!advanced)}
          className='button'
        >Advanced Server Settings {advanced ? <RxCaretDown/> : <RxCaretUp/>}
        </button>
        {advancedSettings}
      </div>
    </div>
    <div className='flex justify-start py-2'>
      <button
        disabled={disableButton}
        onClick={handleSet}
        className={`${disableButton ? 'button-disabled'
          : 'button-enabled'} button px-1 py-1`}
      ><BsArrowUpSquare/><span className='px-1'>Set</span></button>
    </div>
  </div>
}
