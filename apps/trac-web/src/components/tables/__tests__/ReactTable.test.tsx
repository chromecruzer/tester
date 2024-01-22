import {DateTime} from "luxon";
import {render, screen, within} from "@testing-library/react";
import React, {ReactElement} from "react";
import {ReactTable} from "../ReactTable";
import _ from "lodash";
import * as util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const paginationKeys = ['pageCount', 'pageIndex', 'pageSize'];
jest.mock('../Pagination', () => ({
  Pagination: props => (<>
    <h4>Mock Pagination</h4>
    <ul>
      {paginationKeys.map(k => {
        return <li key={k}>{k} is {props[k]}</li>
      })}
    </ul>
  </>),
}));

jest.mock('../DownloadButton', () => ({
  DownloadButton: props => (<>
    <h4>Mock Download Button</h4>
    <ul>
      {_.map(props, (v, k) => {
        return <li key={k}>{k} is {dump(v)}</li>
      })}
    </ul>
  </>),
}));

describe('ReactTable', () => {
  let columns, tooltipSpy, cellPropsSpy, keyIndex;
  type DataObject = {
    textColumn: string,
    numberColumn: number,
    dateColumn: string,
    uuid: string
  }
  beforeEach(() => {
    columns = [
      {
        Header: 'Text Column',
        accessor: 'textColumn'
      },
      {
        Header: 'Number Column',
        accessor: 'numberColumn'
      },
      {
        Header: 'Date Column',
        accessor: 'dateColumn'
      },
    ];
    tooltipSpy = jest.fn();
    cellPropsSpy = jest.fn().mockReturnValue('bg-bl-text-light');
    keyIndex = 1000;
  });
  const renderReactTable = (data, children: (ReactElement | null) = null) => {
    // console.log(`data ${dump(data)}`);
    // console.log(`columns ${dump(columns)}`);
    // console.log(`${tooltipSpy ? 'Have' : 'Do not have'} tooltip spy`);
    // console.log(`${cellPropsSpy ? 'Have' : 'Do not have'} cell props spy`);
    if (children) {
      return render(<ReactTable
        columns={columns}
        data={data}
        tooltip={tooltipSpy}
        cellProps={cellPropsSpy}
        rowIdFn={null}
      >
        {children}
      </ReactTable>)
    }
    return render(<ReactTable
      columns={columns}
      data={data}
      tooltip={tooltipSpy}
      cellProps={cellPropsSpy}
      rowIdFn={null}
    >
    </ReactTable>)
  };
  const createData = (numberOfRows) => {
    const result: DataObject[] = [];
    keyIndex += numberOfRows;
    for (let i = 0; i < numberOfRows; i++) {
      const day = (i % 20) + 1;
      const month = Math.round(i / 20) + 1;
      // console.log(`for index ${i} day ${day} month ${month}`);
      const row = {
        textColumn: `text at ${i}`,
        numberColumn: i,
        dateColumn: DateTime.utc(2020, month, day).toFormat('yyyy/MM/dd'),
        uuid: `uuid${keyIndex++}`,
      }
      result.push(row);
    }
    return result;
  }
  const checkPagination = (count, index, size) => {
    let prop = screen.queryByText(`pageIndex is ${index}`);
    expect(prop).not.toBeNull();
    prop = screen.queryByText(`pageCount is ${count}`);
    expect(prop).not.toBeNull();
    prop = screen.queryByText(`pageCount is ${size}`);
    expect(prop).not.toBeNull();
  }
  it('should create a table of 10 rows and 3 columns for more than 10 data items', () => {
    const expectedData = createData(11);
    console.log(`data is ${JSON.stringify(expectedData)}`)
    tooltipSpy.mockReturnValue(null);
    renderReactTable(expectedData);
    const actualRows = screen.queryAllByRole('row');
    expect(actualRows).toHaveLength(10 + 1);// include header row
    const headers = within(actualRows[0]).queryAllByRole('columnheader');
    ['Text Column', 'Number Column', 'Date Column'].forEach(expected => {
      const headerText = headers.map(h => within(h).queryByText(expected))
        .filter(a => a !== null);
      expect(headerText).toHaveLength(1);
    })
    for (let r = 1; r < actualRows.length; r++) {
      const cells = within(actualRows[r]).queryAllByRole('cell');
      expect(cells).toHaveLength(3);
    }
  });
  it('should create a 10 pages for 100 data items', () => {
    const expectedData = createData(100);
    tooltipSpy.mockReturnValue(null);
    renderReactTable(expectedData);
    const pagination = screen.queryByText(`Mock Pagination`);
    expect(pagination).not.toBeNull();
    checkPagination(10, 0, 10);
  });
  it('should hide the Pagination widget for 10 data rows or less', () => {
    const expectedData = createData(10);
    tooltipSpy.mockReturnValue(null);
    renderReactTable(expectedData);
    const pagination = screen.queryByText(`Mock Pagination`);
    expect(pagination).toBeNull();
  });
  it('should embed tooltip into specific cells', () => {
    const tooltipText = 'I am a tooltip';
    const expectedData = createData(8);
    tooltipSpy.mockImplementation(cell => {
      if (cell.row.original.numberColumn % 2
        && (cell.column.id === 'textColumn')) {
        return tooltipText;
      }
      return null;
    });
    renderReactTable(expectedData);
    // screen.debug();
    const tips = screen.queryAllByText(tooltipText);
    expect(tips).toHaveLength(4);
  });
  it('should add children when present', () => {
    const expectedData = createData(10);
    const expectedChildren = <div>
      <button>First Button</button>
      <button>Second Button</button>
      <button>Third Button</button>
    </div>
    tooltipSpy.mockReturnValue(null);
    renderReactTable(expectedData, expectedChildren);
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
  xit('should change the sort based on a column click', () => {

  });
});
