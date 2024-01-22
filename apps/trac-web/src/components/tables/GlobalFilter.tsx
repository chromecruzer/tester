import 'regenerator-runtime/runtime';
import {useState} from "react";

export const GlobalFilter = ({filteredText, setFilteredText}) => {
  // const [text, setText] = useState(filteredText);
  const handleChange = e => {
    const v = e.target.value;
    console.log(`global filter changed value ${v}`);
    // setText(v);
    setFilteredText(v || null);
  }
  return <span>
    Search:
    <input
      className='bg-bl-consumer-light text-bl-text-grey p-2 '
      placeholder='Search'
      value={filteredText || ''}
      onChange={handleChange}
    />
  </span>
}
