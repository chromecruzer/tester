import React from "react";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import FileSelectButton from "../FileSelectButton";
import * as util from "util";
import userEvent from "@testing-library/user-event";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

describe('FileSelectButton', () => {
  const renderFileSelect = (returnSpy, expectedName, expectedLabel, expectedIsDisabled) => {
    render(<FileSelectButton
      returnFile={returnSpy}
      name={expectedName}
      label={expectedLabel}
      disabled={expectedIsDisabled}
    />);
  }
  it('should have a file input button', () => {
    const expectedName = '';
    const returnSpy = jest.fn();
    renderFileSelect(returnSpy, expectedName, 'label', false);
    // screen.debug();
    const input = screen.queryByRole('file-input');
    // console.log(`found input ${dump(input)}`);
    expect(input).toBeInTheDocument();
  });
  xit('should call returnFile once the input has been triggered', () => {
    const xlsxFile = new File(['hello'], 'hello.xlsx',
      {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const returnSpy = jest.fn();
    renderFileSelect(returnSpy, 'expectedName', 'label', false);
    // screen.debug();
    userEvent.setup();
    const input = screen.queryByRole('file-input');
    if(input === null) {
      throw new Error('Cannot find file selector');
    }
    //TODO this does not seem to be triggering the onChange function
    return userEvent.upload(input, xlsxFile).then(() => {
      expect(returnSpy).toBeCalledWith(xlsxFile);
    })

  });
  it('should display a label', () => {
    const returnSpy = jest.fn();
    renderFileSelect(returnSpy, 'expectedName', 'expectedLabel', false);
    // screen.debug();
    const label = screen.queryByText(/expectedlabel/i);
    expect(label).toBeInTheDocument();
  });
});
