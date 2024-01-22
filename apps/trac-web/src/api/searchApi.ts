import axios from "axios";
import _ from 'lodash'
import {httpRoot} from "../httpConfig";
import {getDataFields} from '@trac/datatypes';
import {FilterMap} from "../TracContext";

const searchApi = axios.create({
  baseURL: `${httpRoot}`,
})


export const postSearchForSuggestions = async (text, filters: FilterMap) => {
  const body = {};
  if(!_.isString(text)) { // hack to shut up reqct-query
    return Promise.resolve([]);
  }
  const stackTrace = Error().stack;
  // console.log(`posting retrieve for '${text}'`, filters, stackTrace);
  body[getDataFields.searchText] = text;
  body[getDataFields.filters] = _.reduce(filters, (accum, bool, name) => {
    if(bool) {
      accum.push(name);
    }
    return accum;
  }, [] as string[]);
  // console.log(`sending body`, body);
  const axiosResponse = await searchApi.post('/search', body)
  // console.log(`retrieving suggestions post`, body, axiosResponse.data);
  return axiosResponse.data;
}

