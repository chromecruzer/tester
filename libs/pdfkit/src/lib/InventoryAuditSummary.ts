// noinspection JSVoidFunctionReturnValueUsed


import {centerX} from "./pdfkit";

export default class InventoryAuditSummary {
  private total: string;
  private surgeryPo: string;
  private po: string;

  constructor(total) {
    this.total = `Total ${total}`;
    this.po = 'Purchase Order # for All IOLs';
    this.surgeryPo = 'Use Date of Surgery as PO? Yes / No';
  }

  add(doc, yOffset) {
    let offset = yOffset + 0.4;
    doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor('black');
    doc.text(this.total, 1.14, offset, 'left');
    offset += 0.3;
    doc.text(this.po, 1.14, offset, 'left');
    doc.setLineWidth(1/72).setLineCap('butt').setDrawColor('black');
    doc.line(3.5,offset, 3.27, offset).stroke();
    offset += 0.3;
    doc.text(this.surgeryPo, 1.14, offset, 'left');
  }
}
