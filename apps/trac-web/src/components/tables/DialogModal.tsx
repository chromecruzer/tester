import {useEffect, useRef} from "react";
import _ from "lodash";

export const DialogModal = ({children, open, requestClose, buttonsOnlySize = false}) => {
  const dialogRef = useRef(null);
  const sizeAndStyle = buttonsOnlySize ? 'h-1/5 w-1/3 border-3 border-b-bl-text-dark'
    : 'h-1/2 w-1/2 border-3 border-b-bl-text-dark';
  const lastActiveElement = useRef(null as (Element | null));
  useEffect(() => {
    const dialogNode: any = dialogRef.current;
    if(open) {
      lastActiveElement.current = document.activeElement;
      dialogNode.showModal();
    } else {
      dialogNode.close();
      if(_.has(lastActiveElement, 'current') && lastActiveElement.current) {
        (lastActiveElement.current as HTMLElement).focus();
      }
    }
  }, [open]);
  return <dialog className={sizeAndStyle} ref={dialogRef}>{children}</dialog>
}
