import _ from 'lodash';
import autoTable, {RowInput} from 'jspdf-autotable'
import util from "util";
const expireColumns = [
  {header: 'ITEM', dataKey: 'item'},
  {header: 'DESCRIPTION', dataKey: 'description'},
  {header: 'SERIAL NUMBER', dataKey: 'lot', halign: 'center'},
  {header: 'QTY', dataKey: 'quantity', halign: 'center'},
  {header: 'EXP DATE', dataKey: 'expire_date', halign: 'center'},
  {header: 'Could Lens be located? (Y/N)'}
];
const auditMissing = [
  {header: 'STATUS', dataKey: 'audit_match'},
  {header: 'ITEM', dataKey: 'item'},
  {header: 'SERIAL NUMBER', dataKey: 'lot', halign: 'center'},
  {header: 'QTY', dataKey: 'quantity', halign: 'center'},
  {header: 'Purchase Order To Bill?'},
  {header: 'Found?'}
];


const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const recordsPerPage = 35;
export default class PdfTable {
  private pages: number;
  private length: number;
  private previousEnd: number;
  private currentPage: number;
  yOffset: number;
  private recordsPerLastPage: number;

  constructor(private items, private type) {
    this.length = this.items.length;
    this.recordsPerLastPage = type === 'expired' ? 24 : 30;
    this.pages = Math.floor(this.length / recordsPerPage) +
      (this.length % recordsPerPage > 0 ? 1 : 0);
    this.pages += (this.length % recordsPerPage > this.recordsPerLastPage) ? 1 : 0;
    // console.log(`items ${dump(this.items)}`)
    // console.log(`page calculations result ${this.pages} from ${this.length}
    //     remainder ${this.length % recordsPerPage}
    //     last remainder ${this.length % recordsPerPage} compared to ${(this.recordsPerLastPage)}
    //     comparison ${this.length % recordsPerPage > this.recordsPerLastPage}`);
    this.previousEnd = 0;
    this.currentPage = 0;
    this.yOffset = 0;
  }
  slicePage(): RowInput[] {
    const offset = this.previousEnd;
    let end = offset + recordsPerPage;
    const remainder = this.length - offset;
    // console.log(`calculation for page ${this.currentPage}
    // for recordsPerLastPage ${this.recordsPerLastPage} from type ${this.type},
    // with offset ${offset},
    // end ${end},
    // remainder ${remainder}`);
    switch(true) {
      case end < this.length:
        break;
      case remainder > this.recordsPerLastPage:
        end = ((remainder - this.recordsPerLastPage > this.recordsPerLastPage) ?
          remainder - this.recordsPerLastPage : this.recordsPerLastPage) + offset;
        break;
      default:
        end = this.length;
    }
    // console.log(`slicing from ${offset} to ${end}`);
    this.currentPage += 1;
    this.previousEnd = end;
    return _.slice(this.items, offset, end);
  }
  add(doc) {
    const columns = (this.type === 'expired' ? expireColumns : auditMissing);
    const body = this.slicePage();
    // console.log(`page consignments ${dump(body)}`)
    autoTable(doc, {
      startY: 1.1,
      theme: 'grid',
      margin: {left: 1.14},
      tableWidth: 12.3 - 1.14,
      headStyles: {
        minCellHeight: 1.46 - 0.96,
        fillColor: '#244062',
        lineWidth: 1/72,
        lineColor: 'black',
        valign: 'middle',
        halign: 'center'
      },
      bodyStyles: {
        fontStyle: 'bold',
        font: 'helvetica',
        fontSize: 10,
        cellPadding: .03,
        lineWidth: 1/72,
        lineColor: 'black'
      },
      columnStyles: {
        lot: {halign: 'center'},
        quantity: {halign: 'center'},
        expire_date: {halign: 'center'},
      },
      columns,
      body
    });
    this.yOffset = doc.lastAutoTable.finalY
    return this.currentPage === this.pages;
  }
}
