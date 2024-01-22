import {BatchEdit} from "../BatchEditA";
import _ from "lodash";

export default class BatchProductEdit extends BatchEdit {
  public updatePrice(price) {
    return {
      items: this.uuids,
      price
    }
  }
  public updateExclude(flag) {
    return {
      items: this.uuids,
      flag
    }
  }
}
