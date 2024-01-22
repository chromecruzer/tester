import SelectedRowsState from "./SelectedRowsState";

export class HandleClicks {
  constructor(private selectedRowsState: SelectedRowsState,
              private singleClickAction,
              private doubleClickAction,
              private isMultiSelect,
              private setSelectedUuids
  ) {
  }
  handleClick(row, e) {
    console.log(`handle click for ${row.id}`, row);
    if(!this.isMultiSelect) {
      this.singleClickAction(row.original)
      return;
    }
    switch (true) {
      case e.ctrlKey:
      case e.metaKey:
        this.selectedRowsState.controlClick(row.id);
        break;
      case e.shiftKey:
        this.selectedRowsState.shiftClick(row.id);
        break;
      default:
        this.selectedRowsState.click(row.id);
    }
    this.setSelectedUuids(this.selectedRowsState.getSelectedUuids());
  }

  handleDoubleClick(row, e) {
    console.log(`handle double click for ${row.id}`, row);
    this.selectedRowsState.doubleClick(row.id);
    this.doubleClickAction(row.original);
  }

  decorateRow(row, id) {
    const result = {
      key: id,
      className: `${this.selectedRowsState.isSelected(id)}`,
      onClick: e => this.handleClick(row, e),
      onDoubleClick: e => this.handleDoubleClick(row, e)
    }
    if (result.className) {
      result.className += ' border-2 border-gray-100';
    } else {
      result.className = ' border-2 border-gray-100';
    }
    // console.log(`row ${id} props`, result)
    return row.getRowProps(result);
  }

}
