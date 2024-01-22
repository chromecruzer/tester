import {ReadyState} from "react-use-websocket";
import {useEffect, useState} from "react";
import {HiLightningBolt} from "react-icons/hi";
import { IconContext } from "react-icons/lib";

export const UploadStatus = ({readyStatus, message}) => {
  const [led, setLed] = useState('white');
  const [msg, setMsg] = useState(null as (string | null));
  useEffect(() => {
    let color = 'white';
    switch (readyStatus) {
      case ReadyState.UNINSTANTIATED:
        color = 'white';
        break;
      case ReadyState.OPEN:
        color = 'green';
        break;
      case ReadyState.CLOSING:
      case ReadyState.CLOSED:
        color = 'red';
        break;
      case ReadyState.CONNECTING:
        color = 'yellow';
        break;
    }
    console.log('setting led color', color);
    setLed(color);
    let newMsg;
    if(message) {
      const content = JSON.parse(message.data);
      switch(content.messageType) {
        case 'CONTENT':
          newMsg = `${content.title}: ${content.content}`;
          break;
        case 'NOTIFY_STARTED':
          newMsg = 'Upload has started';
          break;
        case 'CLOSE_COMMAND':
        case 'NOTIFY_COMPLETED':
          newMsg = null;
          break;
      }
    }
    console.log('setting upload message', newMsg);
    console.log('from message', message);
    setMsg(newMsg);
  },[readyStatus, message])
  return <div className='flex flex-row content-center gap-1 items-center'>
    <IconContext.Provider value={{ color: led, className: "global-class-name" }}>
    <HiLightningBolt className=''/>
    </IconContext.Provider>
    <span>{msg}</span>
  </div>
}
