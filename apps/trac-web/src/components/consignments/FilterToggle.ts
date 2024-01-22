import _ from "lodash";
import {RowButtonsState} from "../search/RowButtonsState";

export const changeFiltersC = _.curry((setFilters, filters, updatedButtons: RowButtonsState) => {
  const result = updatedButtons.getStatesMap(false);
  switch(true) { // implement toggling
    case result['premium'] && result['standard'] && !filters['premium']:
      result['premium'] = true;
      result['standard'] = false;
      break;
    case result['premium'] && result['standard'] && !filters['standard']:
      result['premium'] = false;
      result['standard'] = true;
      break;
  }
  setFilters(result);
});
