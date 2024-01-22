import path from "path";
import fs from 'fs-extra';
import _ from "lodash";
import util from "util";
import {centerX} from "./pdfkit";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class PageHeader {
  private customerTitle: string;
  private image: string;

  constructor(customerName, customerId, private tableName) {
    this.customerTitle = `${customerId} - ${customerName}`;
    this.image = null;
    // console.log(`Page header customerId, tableName title ${customerId}, ${this.tableName}, ${this.customerTitle}`);
  }

  async add(doc) {
    if (_.isNull(this.image)) {
      const blImagePath = path.join(__dirname, 'assets/BauschAndLombPdfLogo.png');
      this.image = await fs.readFile(blImagePath)
        .then(contents => contents.toString('base64'))
        .catch(err => {
          console.error(`read of ${blImagePath} failed because ${dump(err)}`);
          return null;
        });
    }
    doc.setLineWidth(1 / 72).setFillColor('#244062');
    doc.rect(1.14, 0.3, 12.38 - 1.15, 0.3, 'F')
    doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor('white');
    doc.text(this.customerTitle, centerX, 0.49, 'center');
    doc.setLineWidth(1 / 72).setFillColor('#244062');
    const boxWidth = 7.07 - 1.14;
    doc.rect(1.14, 0.69, boxWidth, 0.28, 'F')
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('white');
    const offset  = boxWidth/2 + 1.14;
    doc.text(this.tableName, offset, 0.86, 'center');
    //   rect(x, y, w, h)
    // console.log(`image ${this.image}`)
    doc.addImage(this.image, 'PNG', 7.2, 0.68, 12.38 - 7.46, 0.95 - 0.67);
    // doc.setLineWidth(2 / 72).rect(1.14, 0.3, 12.37 - 1.14, 0.75, 'S')
  }
}
