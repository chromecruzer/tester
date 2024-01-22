// noinspection JSVoidFunctionReturnValueUsed


import {centerX} from "./pdfkit";

export default class ExpireSignatureBlock {
  private certification: string;
  private nameLabel: string;
  private signatureBlock: string;
  private phoneLabel: string;
  private dateLabel: string;
  private email: string;
  private fax: string;
  private cooperation: string;
  private help: string;
  private thanks: string;

  constructor() {
    this.email = 'BLexpired@bausch.com';
    this.fax = '(800)822-8918';
    this.certification = 'I hereby certify that the above lenses were destroyed in our facility';
    this.nameLabel = 'Name and Title';
    this.signatureBlock = 'Signature';
    this.phoneLabel = 'Phone';
    this.dateLabel = 'Date';
    this.cooperation = 'We appreciate your time and cooperation';
    this.help = `Please email the form back to ${this.email} or by fax ${this.fax}`;
    this.thanks = 'Thanks for choosing Bausch + Lomb for your surgical needs'
  }

  add(doc) {
    doc.setFontSize(15).setFont('helvetica', 'bolditalic').setTextColor('black');
    doc.text(this.certification, centerX, 7.13, 'center');
    const width = doc.getTextWidth(this.certification);
    doc.setLineWidth(1/72).setLineCap('butt').setDrawColor('black');
    doc.line(centerX - width/2, 7.14,centerX + width/2, 7.14).stroke();
    doc.line(1.14, 7.83, 5.95, 7.83).stroke();
    doc.line(7.45, 7.83, 12.41, 7.83).stroke();
    doc.setFontSize(8);
    doc.text(this.nameLabel, 1.14, 8.0, 'left');
    doc.text(this.signatureBlock, 7.45, 8.0, 'left');

    // doc.setLineWidth(1);
    // doc.setLineCap('butt')
    doc.line(1.14, 8.47, 5.95, 8.47).stroke();
    doc.line(7.45, 8.47, 12.41, 8.47).stroke();
    doc.text(this.phoneLabel, 1.14, 8.62, 'left');
    doc.text(this.dateLabel, 7.45, 8.62, 'left');
    doc.text(this.cooperation, centerX, 8.97, 'center');
    doc.text(this.help, centerX, 9.38, 'center');
    doc.text(this.thanks, centerX, 9.81, 'center');
  }
}
