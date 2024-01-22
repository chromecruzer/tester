import _ from "lodash";
import {TediousParam} from "./tedious";

export default class TediousQuery {
  private params: {[id:string]: TediousParam};
  constructor(private tediousRequest) {
    this.reset();
  }
  addParameters(parameters: {[id:string]: TediousParam}) {
    this.params = {...this.params, ...parameters};
  }
  reset() {
    this.params = {};
  }
  query(msSql: string) {
    _.forEach(this.params, (t, n) => {
      this.tediousRequest.input(n, t.type, t.value)
    });
    return this.tediousRequest.query(msSql);
  }
}
