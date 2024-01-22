import {render, screen} from "@testing-library/react";
import React from "react";
import {DataUploadHistory} from "../DataUploadHistory";
import * as reactRedux from "../../../redux/hooks";

describe('DataUploadHistoryTable', () => {
  let expectedHistory, useSelectorMock, dispatchSpy;
  beforeEach(() => {
    expectedHistory = [
      {
        name: 'filename1',
        type: 'IolReport',
        date: '03/11/2021',
        uuids: {
          adds: [],
          removes: ['uuid1', 'uuid2'],
          modifies: ['uuid3', 'uuid4'],
        },
        user: 'joe user',
      },
      {
        name: 'filename2',
        type: 'IolReport',
        date: '04/11/2014',
        uuids: {
          adds: ['uuid1', 'uuid2'],
          removes: [],
          modifies: ['uuid3', 'uuid4'],
        },
        user: 'janet user',
      },
      {
        name: 'filename3',
        type: 'IolReport',
        date: '03/13/2021',
        uuids: {
          adds: ['uuid3', 'uuid4'],
          removes: ['uuid1', 'uuid2'],
          modifies: [],
        },
        user: 'john user',
      },
      {
        name: 'filename4',
        type: 'IolReport',
        date: '04/11/2021',
        uuids: {
          adds: [],
          removes: [],
          modifies: ['uuid3', 'uuid4'],
        },
        user: 'josephine user',
      },
    ];
    dispatchSpy = jest.fn();
    jest.spyOn(reactRedux, 'useAppDispatch').mockImplementation(() => dispatchSpy);
    useSelectorMock = jest.spyOn(reactRedux, 'useAppSelector');
    useSelectorMock.mockImplementation(() => expectedHistory);
  });
  const renderHistoryTable = () => {
    render(<DataUploadHistory/>)
  };
  it('should create a react table correctly', () => {
    renderHistoryTable();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(5) // includes header row
  });

});
