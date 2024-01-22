import React, {ReactElement} from "react";
import {Tooltip} from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css'
export const CellTooltip = ({message, children, cellProps, columnId, rowId}) : ReactElement => {
  // console.log('tooltip cell props', cellProps);
  // console.log('tooltip children', children);
  if(message) {
    const ttId = `${rowId}_${columnId}_tt`;
    cellProps.className += ' bg-bl-consumer-off-white text-bl-text-dark';
    return <td
      data-tip={true} data-for={ttId}
      {... cellProps}
    >
      {children}
      <Tooltip anchorId={ttId}>
        {message}
      </Tooltip>
    </td>
  }
  return <td {...cellProps}>{children}</td>;
};
