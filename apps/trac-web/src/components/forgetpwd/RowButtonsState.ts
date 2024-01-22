import _ from "lodash";
export interface ButtonState {
  state: boolean;
  title: string;
  key: string;
}

export class RowButtonsState {
  public buttonStates: { [id: string]: ButtonState };
  protected prefix;
  protected active: string;
  protected inactive: string;
  public buttonCallback;

  constructor(buttonStates: ButtonState [], parameterNames: string[] = []) {
    this.buttonStates = _.reduce(buttonStates, (accum, b) => {
      accum[b.key] = b;
      if (_.includes(parameterNames, b.key)) {
        accum[b.key].state = true;
      }
      return accum
    }, {});
    // console.log(`initialized button states`, this.buttonStates);
    this.prefix = 'border-2 px-2 py-2 ';
    this.active = 'filter-button-active';
    this.inactive = 'filter-button-inactive';
    this.buttonCallback = null;
  }
  getStatesMap(onlyPositive = true) {
    return _.reduce(this.buttonStates, (accum, v, k) => {
      if(v.state || !onlyPositive) {
        accum[k] = v.state;
      }
      return accum;
    }, {})
  }
  setStates(states) {
    _.forEach(states, (v,k) => {this.buttonStates[k].state = v});
    if(this.buttonCallback) {
      this.buttonCallback(this.buttonStates);
    }
  }
  setButtonCallback(func, initialStates:(any | null) = null) {
    if (initialStates) {
      this.setStates(initialStates);
    }
    this.buttonCallback = func; // Placed last to prevent React from re-rendering to infinity.
  }

  style(name) {
    let result = this.prefix;
    result += this.buttonStates[name].state ? this.active : this.inactive;
    // console.log(`style for ${name} is ${result}`);
    return result;
  }
  getStatesArray() {
    return _.reduce(this.buttonStates, (accum, v, k) => {
      if (v.state) {
        accum.push(k);
      }
      return accum;
    }, [] as string[]);
  }
  toggleButtonState(name) {
    const state = this.buttonStates[name].state;
    this.buttonStates[name].state = !state;
  }
  getButtonTitle(name) {
    return this.buttonStates[name].title;
  }
  static mapToList(map) {
    return _.reduce(map, (accum, isSet, name) => {
      if(isSet) {
        accum.push(name);
      }
      return accum;
    }, [] as string[])
  }
  static listToMap(list, states) {
    return _.reduce(_.keys(states), (accum, name) => {
      accum[name] = _.includes(list, name);
      return accum
    }, {})
   }
}
