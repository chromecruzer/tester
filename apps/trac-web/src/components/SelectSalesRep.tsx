import React, {useEffect, useMemo, useState} from "react";
import {getSalesReps} from "../api/salesRepApi";
import {useQuery} from "@tanstack/react-query";
import _ from "lodash";
const fullName = d => `${d.last_name} ${d.first_name}`;
export const SelectSalesRep = ({choose}) => {
  const [title, setTitle] = useState('SP')
  const [name, setName] = useState('Select Name')
  const queryOptions = useMemo(() => {
    return {
      queryKey: ['sales reps'],
      queryFn: () => getSalesReps({}),
      select: data => {
        return data;
      },
    };
  }, [])
  const {data, isLoading} = useQuery(queryOptions);
  const titles = useMemo(() => {
    const result =  _.reduce(data, (accum, d) => {
      accum[d.title] = true;
      return accum;
    }, {});
    return _.keys(result);
  }, [data]);
  const nameMap = useMemo(() => {
    return _.reduce(data, (accum, d) => {
      accum[fullName(d)] = d;
      return accum;
    }, {});
  }, [data]);
  const names = useMemo(() => {
    const result =  _.filter(_.keys(nameMap), n => nameMap[n].title === title);
    setName(result[0]);
    return _.sortBy(result);
  }, [nameMap, title]);
  const handleNameChange = (e) => {
    // console.log('changing name to', e.target.value)
    setName(e.target.value);
  }
  // console.log(`names and selection`, nameMap, names)

  return <>
    <div className='flex'>
    <h4 className='py-2 px-3'>Select a Sales Rep</h4>
    <div className='flex'>
    <h4 className='py-2 px-3'>Title:</h4>
    <select
      value={title}
      onChange={e => setTitle(e.target.value)}
      className='py-2 px-3 uppercase cursor-pointer bg-bl-text-light text-bl-text-grey'
    >
      {titles.map(t => (<option key={t}>{t}</option>))}
    </select>
    </div>
    <h4 className='py-2 px-3'>Name:</h4>
      {_.isEmpty(names) ? <h4>Loading...</h4> : <select
        value={name}
        onChange={handleNameChange}
        className='py-2 px-3 uppercase cursor-pointer bg-bl-text-light text-bl-text-grey'
      >
        {_.map(names, k => (<option key={k}>{k}</option>))}
      </select>}
  </div>
    <button
      onClick={() => choose(nameMap[name])}
      className='button-enabled button'
    >Select</button>
    </>

}
