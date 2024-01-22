import {useMemo} from "react";
import _ from "lodash";

export const NoteCard = ({note, maps}) => {
  const content = useMemo(() => {
    return _.split(note.content, '\\n');
  }, [note])
  const annotation = note.annotate_type === 'Audit' ? 'Audit' : maps.getItem(note.annotated_uuid).lot;
  return <div className='flex-col px-1 py-1 border-b-2 border-bl-text-grey justify-start'>
    <div className='flex px-1 py-1 place-content-between text-bl-consumer-main'>
      <h4>{annotation}</h4>
    </div>
    <div className='flex-col px-1 py-1'>{_.map(content, (c, i) => <h4 key={i}>{c}</h4>)}</div>
    <div className='flex px-1 py-1 place-content-between'>
      <div className='flex border-2 place-content-start border-bl-consumer-off-white text-bl-consumer-main'>
        <h4>By:</h4><span className='px-1'>{note.author}</span>
      </div>
      <div className='flex border-2 border-bl-consumer-off-white text-bl-consumer-main'>
        <h4>On:</h4><span  className='px-1'>{note.date_created}</span>
      </div>
    </div>

  </div>
};
