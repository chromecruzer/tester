import {getDataFields} from "@trac/datatypes";
import _ from "lodash";
import XLSX from 'xlsx';
import UploadManager from "./datastore/UploadManager";
import util from "util";
import {tryCatch} from "@trac/postgresql";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export class DownloadSpreadsheet {

  public convertToSpreadsheet() {
    return tryCatch(async (req, res, next) => {
      const headers = req.body[getDataFields.headers];
      const spreadsheet = req.body[getDataFields.spreadsheet];
      const spreadsheet0 = req.body[getDataFields.spreadsheet0] || null;
      res.attachment(`TracSpreadsheet_${UploadManager.newToken()}.xlsx`);
      res.status(200).end(this.saveFile(this.convertSpreadsheet(headers, spreadsheet), spreadsheet0));
    })
  }

  private convertSpreadsheet(headers, spreadsheet) {
    // console.log(`headers ${headers.length}`);
    return _.map(spreadsheet, r => {
      const result = {};
      for (let h = 0; h < headers.length; h++) {
        // if(headers[h].header === 'Audit Notes') {
        //   console.log(`index ${headers[h].accessor} ${headers[h].header}=${dump(r[headers[h].accessor])}`);
        // }
        result[headers[h].header] = r[headers[h].accessor];
      }
      return result;
    });
  }

  private saveFile(content, sheet0 = null) {
    // console.log(`spreadsheet ${dump(content)}`)
    const workbook = XLSX.utils.book_new();
    let worksheet;
    if (sheet0) {
      worksheet = XLSX.utils.json_to_sheet(sheet0);
      XLSX.utils.book_append_sheet(workbook, worksheet);
    }
    worksheet = XLSX.utils.json_to_sheet(content);
    XLSX.utils.book_append_sheet(workbook, worksheet);
    // XLSX.writeFile(workbook, 'spreadsheet.xlsx', {type: 'buffer', bookType:'xlsx'})
    //  writeFileSync('bufferedspreadsheet.xlsx', XLSX.write(workbook, {type: 'buffer', bookType:'xlsx'}), 'binary');
    return XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'})
  }
}
