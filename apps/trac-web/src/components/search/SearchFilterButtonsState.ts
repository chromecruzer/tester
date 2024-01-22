import _ from "lodash";
import {ButtonState, RowButtonsState} from "./RowButtonsState";

export default class SearchFilterButtonsState extends RowButtonsState {
  constructor(buttonStates: ButtonState [],
              parameterNames: string[] = [],
              private tableNames: string[] = [],
              private defaultStates: ({[id:string]:boolean} | null) = null
  ) {
    super(buttonStates, parameterNames);
  }

  reduxFilter() {
    let found1 = false;
    const result = _.reduce(this.buttonStates, (accum, v, k) => {
      if (_.includes(this.tableNames, k)) {
        accum[k] = v.state;
        if (v.state) {
          found1 = true;
        }
      }
      return accum;
    }, {});
    return found1 ? result : this.defaultStates;
  }
}
