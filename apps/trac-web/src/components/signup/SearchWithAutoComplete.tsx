import _ from "lodash";
import React, {useMemo, useRef, useState} from "react";
import {MdOutlineClear} from "react-icons/md";
import AutoCompleteDebouncer from "./AutoCompleteDebouncer";
import {SearchSpecifications, useTracContext} from "../../TracContext";
import {useQuery} from "@tanstack/react-query";
import {postSearchForSuggestions} from "../../api/searchApi";
import {NullableString} from "@trac/datatypes";
const debouncer = AutoCompleteDebouncer.createInstance(3000);
export type ArrowKeys = ('ArrowDown' | 'ArrowUp' | 'PageDown' | 'PageUp' | null );
const pageSize = 5;

export const SearchWithAutoComplete = ({setChosen, label = 'Search', alwaysSuggestions = false,
                                         children}) => {
  const typedText = useRef<HTMLInputElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const {getTracContext} = useTracContext();
  const {filters: filtersFromContext} = getTracContext("search") as SearchSpecifications;
  const [searchText, setSearchText] = useState(null as NullableString);
  const [inputHasFocus, setInputHasFocus] = useState(true);
  const [suggestionsCursor, setSuggestionsCursor] = useState(0);
  const scrollOffsets = {
    ArrowUp: 1,
    ArrowDown: 0,
    PageUp: 2,
    PageDown: -1,
  }
  const cursorMath = (change: ArrowKeys) => {
    const increment = change === 'ArrowUp' || change === 'ArrowDown' ? 1 : pageSize;
    const direction = change === 'ArrowUp' || change === 'PageUp' ? -1 : 1;
    const newCursor = suggestionsCursor + (increment * direction);
    console.log(`new cursor ${newCursor} from suggestions cursor ${suggestionsCursor}, increment ${increment} and direction ${direction}`)
    if(newCursor < 0) {
      return 0;
    }
    if(newCursor >= suggestions.length) {
      return suggestions.length - 1;
    }
    return newCursor;
  }
  // console.log(`autocomplete search ${searchText}`, filters);
  const setSearch = text => {
    console.log(`AUTO complete setting search text to ${text}`);
    setSearchText(text)

  }
  const getTypedText = () => {
    if(typedText.current) {
      return typedText.current.value;
    }
    return null;
  };
  const clearSearch = () => {
    // console.log('clearing the search');
    setSearch(null);
    if(typedText.current) {
      typedText.current.value = '';
    }
    debouncer.clear();
  }
  const onKeyChange = e => {
    const key = e.key;
    const text = getTypedText();
    // console.log(`processing ${key} and ${text}`,e);
    switch (key) {
      case 'Backspace':
      case 'Delete':
        if(!_.isString(text) || text.length === 1) {
          clearSearch();
          return;
        }
        break;
      case 'Enter':
      case 'Tab':
        if(inputHasFocus && !alwaysSuggestions && !_.isEmpty(suggestions)) {
          console.log(`choosing typed text `, getTypedText());
          setChosen({field: getTypedText(), suggestion: null});
        } else {
          console.log(`choosing suggestion ${suggestionsCursor} at`, suggestions[suggestionsCursor]);
          setChosen({field: null, suggestion: suggestions[suggestionsCursor]})
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
      case 'PageDown':
      case 'PageUp':
        // console.log(`setting suggestions key for cursor ${suggestionsCursor}`, key)
        setSuggestionsCursor(() => cursorMath(key));
        if(inputHasFocus) {
          setInputHasFocus(false);
        }
        console.log('UL Children', ulRef.current?.children)
        ulRef.current?.children[suggestionsCursor + scrollOffsets[key]].scrollIntoView();
        console.log('UL Children', ulRef.current?.children[suggestionsCursor + scrollOffsets[key]])
        break;
      default:
        debouncer.set(() => setSearch(`${text}${key}`), `${text}${key}`, `${text}${key}`.length);
    }
  }
  const {
    isLoading,
    isError,
    error,
    data: suggestions
  } = useQuery(['search', searchText, filtersFromContext],
    () => postSearchForSuggestions(searchText, filtersFromContext), {
      select: data => {
        // console.log(`querying using ${searchText}`, filtersFromContext);
        // console.log('queried suggestions', data)
        return data
      },
      enabled: !!searchText,
    })
  if (isError) {
    console.error(`Server returned an error ${error}`)
  }
  const onClick = e => {
    // console.log(`clicked on`, e);
    const selected = _.find(suggestions, s => s.field === e.target.firstChild.textContent)
    setChosen({field: null, suggestion: selected});
    clearSearch();
  }

  const suggestionHasFocus = (index) => {
    // console.log(`setting suggestions index to ${index}`);
    setInputHasFocus(false)
    setSuggestionsCursor(index)
  }

  const generateClassName = (index) => {
    // console.log(`setting highlight on index ${index}`)
    return index === suggestionsCursor ? 'bg-bl-consumer-second' : 'bg-bl-consumer-light';
  }
  // console.log(`visible with text ${searchText} and loading ${isLoading}`)
  const suggestionsList = useMemo(() => {
    if (getTypedText()) {
      switch (true) {
        case isLoading:
          return <ul>
            <li>...Loading...</li>
          </ul>;
        case _.isEmpty(suggestions):
          return <ul>
            <li>Nothing Was Found</li>
          </ul>;
        default:
          // console.log(`cursor at ${suggestionsCursor}`)
          return <ul className='overflow-y-auto h-32 border-2' ref={ulRef}>
            {_.map(suggestions, (s, i) => {
              // console.log(`generating selection for ${s.field} className ${generateClassName(i)}`);
              return <li
                key={s.uuid}
                onClick={onClick}
                onKeyDown={onKeyChange}
                data-tip={true}
                onMouseEnter={() => suggestionHasFocus(i)}
                className={generateClassName(i)}>
                {s.field}
              </li>
            })}
          </ul>
      }
    }
    return null;
  },[searchText, typedText.current, isLoading, suggestions, suggestionsCursor])


  return <div className='flex justify-s items-start'>
    <h4 className='py-2 px-3'>{label}</h4>
    <div className='flex-row'>
      <div className='flex border-2 hover: border-lime-500'>
        <input
          type='text'
          ref={typedText}
          onClick={() => setInputHasFocus(true)}
          placeholder='Search'
          // onChange={onChange}
          onKeyDown={onKeyChange}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey'
        />
        {getTypedText() !== null && <button onClick={clearSearch}><MdOutlineClear/></button>}
      </div>
      {suggestionsList}
    </div>
    {children}
  </div>
}
