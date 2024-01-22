import JsPDF from "jspdf";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class TracPdf {
  public doc: JsPDF;
  public landscapeSizeInInches: { w: number; h: number };
  constructor() {
    this.landscapeSizeInInches = {h: 10.33, w: 13.38}; // measured a sample from Gimp.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.doc = new JsPDF({
      font: 'Times-Roman',
      orientation: 'landscape',
      unit: 'in',
      format: [this.landscapeSizeInInches.h, this.landscapeSizeInInches.w],
      // margins: {
      //   top: 21,
      //   bottom: 18,
      //   left: 72,
      //   right: 72
      // }
    });
    // console.log(`font list ${dump(this.doc.getFontList())}`)
  }
  async writeToFile(filename) {
    return this.doc.save(filename);
  }
}
