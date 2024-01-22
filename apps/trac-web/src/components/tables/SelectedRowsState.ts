import _ from "lodash";

const dump = obj => JSON.stringify(obj, null, 2);
type ShiftSelectState = ('FIRST SELECTION' | 'CONTIGUOUS SELECTION' | 'MULTIPLE SELECTION');

export default class SelectedRowsState {
  private selectedRows: { [id: string]: boolean };
  private rowOrder: { [id: string]: number };

  constructor(selectedUuids) {
    this.selectedRows = {};
    this.rowOrder = {};
    this.setState(selectedUuids)
  }
  setState(uuids) {
    this.setSelectedUuids(uuids);
  }
  getSelectedUuids() {
    return _.filter(_.keys(this.selectedRows), k => this.selectedRows[k]).sort();
  }

  setSelectedUuids(uuids) {
    _.forEach(uuids, u => this.selectedRows[u] = true);
  }
  setRowOrder(uuids) {
    this.rowOrder = _.reduce(uuids, (accum, uuid, i) => {
      accum[uuid] = i;
      return accum;
    },{});
  }

  isSelected(uuid) {
    return this.selectedRows[uuid] ? 'selected-row' : 'normal-row';
  }

  clear() {
    this.selectedRows = {};
  }

  click(uuid) {
    // console.log(`clicked row`, uuid);
    this.clear();
    this.selectedRows[uuid] = true;
  }

  doubleClick(uuid) {
    // console.log(`double clicked row`, uuid);
    this.clear();
  }

  controlClick(uuid) {
    // console.log(`control clicked row`, uuid);
    this.selectedRows[uuid] = true;
  }

  shiftClick(uuid) {
    // console.log(`shift clicked row`, uuid);
    // check if a set of selections exists
    let bounds;
    const state = this.shiftSelect();
    switch(state) {
      case 'FIRST SELECTION':
        this.selectedRows[uuid] = true;
        return;
      case 'CONTIGUOUS SELECTION':
        this.adjustBlock(uuid);
        return;
      case 'MULTIPLE SELECTION':
        bounds = this.findClosestSelection(uuid);
        // console.log(`filling in ${dump(bounds)}`);
        this.fillBlock(bounds.first.row, bounds.last.row);
    }
    //    Get the bounds of the selection
    //    If current is less than the high bound then use the low bound
    //    Otherwise use the high bound
    // check if no other selections exists
    //    mark the current selection turn on shift mode and return
    // check if one other selection exists
    //   determine which selection is higher in order
    //   mark all the rows in between
  }

  private shiftSelect(): ShiftSelectState {
    const selected = this.getSelectedUuids()
    switch (true) {
      case selected.length === 0:
        return 'FIRST SELECTION';
      case this.isContiguous():
        return 'CONTIGUOUS SELECTION';
      default:
        return 'MULTIPLE SELECTION';
    }
  }

  private selectBlock() {
    const selected = _.map(this.getSelectedUuids(), uuid => {
        return {uuid, row: this.rowOrder[uuid]};
    })
    return _.sortBy(selected, ['row']);
  }

  private isContiguous() {
    const block = this.selectBlock();
    const first = block[0].row;
    // console.log(`contiguous first ${first}, ${dump(block)}`);
    for(let i = 0; i < block.length; i++) {
        if(block[i].row !== i + first) {
          return false;
        }
    }
    return true;
  }

  private adjustBlock(uuid) {
    const block = this.selectBlock();
    let first, last;
    const [newBound, oldFirst, oldLast] = [this.rowOrder[uuid], block[0].row, block[block.length - 1].row];
    switch(true) {
      case newBound < oldFirst:
        first = newBound;
        last = oldLast;
        break;
      default:
        first = oldFirst;
        last = newBound;
        break;
    }
    this.clearBlock(block);
    return this.fillBlock(first, last);
  }

  private clearBlock(block: { row: number; uuid: string }[]) {
    _.forEach(block, b => {
      this.selectedRows[b.uuid] = false;
    });
  }

  private fillBlock(first, last) {
    _.forEach(this.rowOrder, (r, uuid) => {
      if(r >= first && r <= last) {
        this.selectedRows[uuid] = true;
      }
    });
  }
  private findClosestSelection(uuid) {
    const selected = this.selectBlock();
    // console.log(`working with block ${dump(selected)}`);
    const rowOrder = this.rowOrder[uuid];
    // console.log(`shift clicked row ${rowOrder} uuid ${row}`)
    let isLess = rowOrder < selected[0].row;
    let b = 0;
    while(!isLess && b < selected.length - 1) {
      b++;
      isLess = rowOrder < selected[b].row;
    }
    // console.log(`result is isLess=${isLess} row=${selected[b].row}`);
    switch(true) {
      case isLess && b === 0:
        return {first: {uuid, row: rowOrder}, last: selected[0]};
      case isLess:
        return {first: selected[b - 1], last: selected[b]};
      default:
        return {first: selected[selected.length - 1], last: {uuid, row: rowOrder}};
    }
  }
}
