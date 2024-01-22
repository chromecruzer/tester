import _ from "lodash";
import {FilterMap} from "../../TracContext";
export type ItemPatternName = ('Not Matches' | 'Unresolved' | 'All' | 'Custom' | 'None');
const itemPatterns = {
  'Not Matches': [
    'Found In Other Location',
    'Billed',
    'No Match',
    'Missing',
    '',
  ],
  'Unresolved': [
    'No Match',
    'Missing',
  ],
  'All': [
    'True Match',
    'Found In Other Location',
    'Billed',
    'No Match',
    'Missing',
    '',
  ],
  'None': [],
}
export const initialItemFilterStates = {
  'True Match': false,
  'Found In Other Location': true,
  'Billed': true,
  'No Match': true,
  'Missing': true,
  '': true,
};

export default class ItemFilterState {
  public filterState: FilterMap;
  public pattern: ItemPatternName;
  constructor(filters: FilterMap, pattern: ItemPatternName) {
    this.filterState = filters;
    this.pattern = pattern;
  }

  getPatternList() {
    return ['Not Matches', 'Unresolved', 'All', 'None'];
  }
  setPattern(pattern) {
    this.pattern = pattern;
    const filters = itemPatterns[pattern];
    _.forEach(this.filterState, (v, f) => {
      this.filterState[f] = _.includes(filters, f);
    })
  }
  setCustom(filter, value:boolean) {
    this.pattern = 'Custom';
    this.filterState[filter] = value;
  }
  isSet(filter) {
    return this.filterState[filter];
  }
  getFilterMap() {
    return {...this.filterState};
  }
  getFilterList() {
    return _.reduce(this.filterState, (accum, v, f) => {
      if(v) {
        accum.push(f);
      }
      return accum;
    }, [] as string[])
  }
}
