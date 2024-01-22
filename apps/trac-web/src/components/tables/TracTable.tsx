import React, {useCallback, useEffect, useState} from "react";
import _ from "lodash";
import {GlobalFilter} from "./GlobalFilter";
import {CellTooltip} from "./CellTooltip";
import ErrorBoundary from "../ErrorBoundary";
import SelectedRowsState from "./SelectedRowsState";
import {NullableString} from "@trac/datatypes";
import TableOps, {SortingDirection} from "./TableOps";

const dump = obj => JSON.stringify(obj, null, 2);

const selectedRowsState = new SelectedRowsState([]);
export const TracTable = ({
                            columns,
                            data = [] as any[],
                            getRowIdFn = row => row.uuid,
                            createTooltipFn = null as (null | ((any) => NullableString)),
                            addCellPropsFn = (col, cell, row) => (''),
                            singleClickAction = row => {
                              return
                            },
                            doubleClickAction = row => {
                              return
                            },
                            isMultiSelect = false,
                            needGlobalFilter = true,
                            children,
                          }) => {
  const [sorting, setSorting] = useState<(SortingDirection | null)>(null)
  const [globalFilter, setGlobalFilter] = useState(null as NullableString);
  const [filteredData, setFilteredData] = useState([]);
  const globalFilterFn = data => {
    if (_.isString((globalFilter))) {
      return _.filter(data, r => {
        // console.log('global examining row', r, _.values(r));
        return _.filter(_.values(r), v => _.includes(_.lowerCase(v), _.lowerCase(globalFilter))).length > 0;
      });
    }
    return data;
  };
  useEffect(() => {
    const filtered = globalFilterFn(data);
    if(!_.isEqual(filtered, filteredData)) {
      // console.log('setting table data', filtered)
      setFilteredData(filtered);
    }

  }, [data, globalFilter])
  const ops = new TableOps(filteredData, columns, setSorting, sorting);
  // console.log('latest table results', globalFiltered);
  const [selectedUuids, setSelectedUuids] = useState([] as string[]);
  selectedRowsState.setSelectedUuids(selectedUuids);

  const getRowId = useCallback((row) => getRowIdFn(row), [getRowIdFn]);
  const handleClick = (row, e) => {
    // console.log(`handle click for ${row.uuid}`, row);
    if (!isMultiSelect) {
      singleClickAction(row.uuid);
      return;
    }
    switch (true) {
      case e.ctrlKey:
      case e.metaKey:
        selectedRowsState.controlClick(row.uuid);
        break;
      case e.shiftKey:
        selectedRowsState.shiftClick(row.uuid);
        break;
      default:
        selectedRowsState.click(row.uuid);
    }
    setSelectedUuids(selectedRowsState.getSelectedUuids());
    singleClickAction(selectedRowsState.getSelectedUuids());
    // console.log(`clicked row ${row.uuid}`, selectedRowsState.getSelectedUuids());
  };

  const handleDoubleClick = (row, e) => {
    // console.log(`handle click for ${row.uuid}`, row);
    selectedRowsState.doubleClick(row.uuid);
    setSelectedUuids(selectedRowsState.getSelectedUuids());
    doubleClickAction(row.uuid);
  }

  const rowProps = row => {
    const result = {
      key: getRowId(row),
      className: `${selectedRowsState.isSelected(row.uuid)}`,
      onClick: e => handleClick(row, e),
      onDoubleClick: e => handleDoubleClick(row, e)
    }
    result.key = row.uuid;
    if (result.className) {
      result.className += ' border-2 border-gray-100';
    } else {
      result.className = ' border-2 border-gray-100';
    }
    // console.log(`row ${row.uuid} props`, result)
    return result;
  };


  selectedRowsState.setRowOrder(ops.getRowIds());
  const filter = needGlobalFilter ? <GlobalFilter
    filteredText={globalFilter}
    setFilteredText={setGlobalFilter}/> : null;

  // console.log('creating table from ', columns, filteredData)
  return <div className='min-w-0 w-full'>
    <div className='flex flex-row items-center gap-1 w-full min-w-0'>
      {filter}
      {children}
    </div>
    <div className='scrolledContainer-100'>
      <table className='border-2 border-b-bl-text-grey'>
        <thead className='stickyContainer w-full'>
        {ops.getHeaders()}
        </thead>
        <tbody>
        {
          ops.getRows().map(r => {
            return (
              <tr {...rowProps(r)}>
                {
                  columns.map(col => {
                    const cell = r[col.accessor];
                    const cellId = `${r.uuid}-${col.accessor}`;
                    if (createTooltipFn) {
                      return <ErrorBoundary><CellTooltip
                        message={createTooltipFn(cell)}
                        cellProps={addCellPropsFn(col, cell, r)}
                        rowId={r.uuid}
                        columnId={cellId}>
                        {cell}
                      </CellTooltip></ErrorBoundary>
                    } else {
                      return <td key={cellId} className={ops.mergeCellProps(addCellPropsFn, col, cell, r)}>{cell}</td>
                    }
                  })}
              </tr>
            )
          })
        }
        </tbody>
      </table>
    </div>
  </div>
}
