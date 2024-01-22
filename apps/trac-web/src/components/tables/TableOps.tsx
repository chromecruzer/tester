import _ from "lodash";
import {IconContext} from "react-icons/lib";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md";

enum SortDirectionEnum {
  asc = 'asc',
  desc = 'desc',
  none = 'none',
}

export interface SortingDirection {
  accessor: string;
  direction: SortDirectionEnum;
  customConvert?: (a) => number,
}

export interface ColumnSpecifications {
  header: string;
  accessor: string;
  alignment?: ('center' | 'left' | 'right')
  sortConvertFn?: (a) => number,
  width?: string;
}

const arrowIcon = {
  desc: <MdKeyboardArrowDown className='px-1'/>,
  asc: <MdKeyboardArrowUp className='px-1'/>,
  none: '',
}
export default class TableOps {
  constructor(private data, private columns: ColumnSpecifications[],
              private setSorting,
              private sorting = null as (SortingDirection | null)) {
  }

  getRowIds() {
    return _.map(this.getRows(), d => d.uuid);
  }

  getHeaders() {
    return <tr className='tableHeaderRow'>{_.map(this.columns, c => (<th key={c.header}
                                                                         onClick={() => this.toggleSortColumn(c)}
                                                                         className={`tableHeader ${this.mergeCellProps(null,
                                                                           {...c, alignment: 'text-center'})}`}>
      <IconContext.Provider value={{className: 'react-icons', size: '2em'}}>
        <span className='flex flex-row flex-nowrap'>{c.header}{this.getArrowIcon(c)}</span></IconContext.Provider>
    </th>))}</tr>
  }

  public mergeCellProps(cellProps, col, value = null, row = null) {

    return `${cellProps ? cellProps(col, value, row) : ''} text-${col.alignment || 'center'} ${col.width ? col.width : ''}`
  }

  private getArrowIcon(col) {

    if (_.isObject(this.sorting) && this.sorting.accessor === col.accessor) {
      return arrowIcon[this.sorting.direction];
    }
    return null;
  }

  public getRows() {
    if (this.sorting === null) {
      return this.data;
    }
    // console.log(`order by direction is desc ${this.sorting.direction === SortDirectionEnum.desc}`, this.sorting);
    return _.orderBy(this.data, this.sorting.customConvert || [this.sorting.accessor],
      [this.sorting.direction === SortDirectionEnum.desc ? 'desc' : 'asc']);
  }

  private toggleSortColumn(col) {
    const oldSort = this.sorting || null;
    const convertFn = col.sortConvertFn ? a => col.sortConvertFn(a[col.accessor]) : undefined;
    switch (true) {
      case !_.isObject(this.sorting):
      case col.accessor !== oldSort?.accessor:
        this.sorting = {accessor: col.accessor, direction: SortDirectionEnum.asc, customConvert: convertFn}
        break;
      case col.accessor === oldSort?.accessor && oldSort?.direction === SortDirectionEnum.asc:
        this.sorting = {accessor: col.accessor, direction: SortDirectionEnum.desc, customConvert: convertFn};
        break;
      case col.accessor === oldSort?.accessor && oldSort?.direction === SortDirectionEnum.desc:
        this.sorting = null;
    }
    // console.log(`setting sorting to `, this.sorting, col);
    this.setSorting(this.sorting);
  }
}
