import {CellTooltip} from "../CellTooltip";
import {render, screen, within} from "@testing-library/react";

describe('CellTooltip', () => {
  let tdChild;
  beforeEach(() => {
    tdChild = 'I am a TD child';
  });
  const renderCellTooltip = (expectedMessage) => {
    const cellProps = {className: ''};
    return render(
      <table><tbody><tr>
      <CellTooltip
      message={expectedMessage}
      cellProps={cellProps}
      columnId='columnId'
      rowId='rowId'
  >
      {tdChild}
    </CellTooltip></tr></tbody></table>)
  }
  it('should create a tooltip with the td cell', () => {
    renderCellTooltip('Expected Tooltip');
    // screen.debug();
    const td = screen.queryByText(tdChild);
    // screen.debug(td);
    if(td === null) {
      throw new Error('Cannot find table cell');
    }
    expect(td.getAttribute('class')).toMatchSnapshot();
    expect(td.getAttribute('data-for')).toMatchSnapshot();
    expect(td.getAttribute('data-tip')).toBeTruthy();
    const tooltip = screen.queryByText('Expected Tooltip');
    const id = td.getAttribute('data-for');
    // screen.debug(tooltip);
    if(tooltip === null) {
      throw new Error('Cannot find tooltip');
    }
    expect(tooltip.getAttribute('id')).toEqual(id);
  });
  it('should create a normal td cell', () => {
    renderCellTooltip(null);
    // screen.debug();
    const td = screen.queryByText(tdChild);
    expect(td).not.toBeNull();
    const tooltip = screen.queryByText('Expected Tooltip');
    expect(tooltip).toBeNull();
  });
});
