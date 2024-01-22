import * as fs from "fs-extra";
import * as xlsx from "xlsx";
import util from "util";
import _ from "lodash";
import {InputToSqlMapping} from "../../datatypes/src";
import {NotificationsServer} from "./index";
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

const checkLength = (datum, mapping, cell) => {
  const regex = /char\((\d+)\)/;
  const sqlLength = parseInt(regex.test(mapping.sqlType) ? regex.exec(mapping.sqlType)[1] : '0');
  switch (true) {
    case sqlLength === 0:
      return;
    case !_.isString(datum):
      console.error(`datum '${datum}' does not have a value ${dump(cell)} for mapping ${dump(mapping)}`);
      return;
    case sqlLength < datum.length:
      console.error(`datum '${datum}' length ${datum.length} won't fit in sql ${dump(mapping)}`);
      return;
    default:
  }
}

export default class LoadXlsxData {
  fs = fs;
  xlsx = xlsx;
  public bulkData: (string | number | Date)[][];
  public lotNumbers: string [];
  headers: string[];

  constructor(protected ns = null  as (NotificationsServer | null)) {
    this.bulkData = [];
    this.headers = [];
  }

  async scanForLotNumbers(xlsxPath: string) {
    console.log(`called with ${xlsxPath}`);
    this.bulkData = [];
    const newLotNumbers = [];
    const sheet = await this.readFirstSheet(xlsxPath);
    let emptyRowCounter = 0;
    let row = 1;

    while (emptyRowCounter < 8) {
      const lotNumber = this.findLotNumber(row, sheet);
      // console.log(`read sheet row ${row} found ${lotNumber}`);
      if(_.isString(lotNumber)) {
        newLotNumbers.push(lotNumber);
        emptyRowCounter = 0;
      } else {
        emptyRowCounter += 1;
      }
      row++;
    }
    console.log(`scanForLotNumbers found original ${newLotNumbers.length} records versus ${_.uniq(newLotNumbers).length} unique records`)
    this.lotNumbers = newLotNumbers;
  }

  private findLotNumber(row, sheet) {
    const cellAddress = `A${row}`;
    const cell = sheet[cellAddress];
    if (cell) {
      // console.log(`cell contents ${dump(cell)}`);
      switch (cell.t) {
        case 'n':
          return _.toString(cell.w);
        case 's':
          if (!_.isEmpty(cell.w)) {
            return cell.w;
          }
          break;
        default:
      }
    }
    return null;
  }

  async readWithMap(xlsxPath: string, mapping: InputToSqlMapping[]) {
    const firstSheet = await this.readFirstSheet(xlsxPath);
    let emptyRow = false;
    this.loadHeaders(firstSheet);
    let row = 2; //row 1 is the headers
    // console.log(`reading with mapping ${dump(mapping)} from ${xlsxPath}`)
    // console.log(`and received ${dump(firstSheet)}`)
    while (!emptyRow) {
      const dataRow: (Date | string | number)[] = [];
      emptyRow = true;
      mapping.forEach(c => {
        const cellAddress = `${c.xlsxAddress}${row}`;
        let datum: (Date | string | number) = null;
        if (firstSheet[cellAddress] !== undefined) {
          const cellValue = firstSheet[cellAddress].w || firstSheet[cellAddress].v;
            emptyRow = false;
          switch (c.dataType) {
            case 'date':
              datum = new Date(cellValue);
              break;
            case 'number':
              datum = parseInt(cellValue);
              break;
            case 'string':
              datum = cellValue;
              checkLength(datum, c, firstSheet[cellAddress]);
              break;
            default:
              datum = cellValue;
          }
        }
        // console.log(`datum ${datum} row
        // is ${emptyRow ? '' : ' not'} empty
        // from ${dump(firstSheet[cellAddress])}`);

        dataRow.push(datum);
      });
      if (!emptyRow) {
        this.bulkData.push(dataRow);
        row++;
      }
    }
  }

  private loadHeaders(firstSheet) {
    let col = 0;
    let header;
      do {
        header = null;
        const cellAddress = xlsx.utils.encode_cell({r:0, c:col});
        // console.log(`header cell ${dump(firstSheet[cellAddress])}`)
        if(_.isObject(firstSheet[cellAddress])) {
          header = firstSheet[cellAddress].w;
          // console.log(`header for cell ${cellAddress} column ${col} is ${dump(header)}`)
          this.headers.push(header);
        }
        col += 1;
      } while (header);
  }
  private async readFirstSheet(xlsxPath: string) {
    if(this.ns) {
      this.ns.notify('INFO', `reading IOL Report`,
        `reading from ${xlsxPath}`, ['iolUpload'])
    }
    console.info(`reading from ${xlsxPath}`);
    const buffer = await this.fs.readFile(xlsxPath)
      .catch(err => {
        throw new Error(`"${xlsxPath}" could not be read because ${err}`)
      });
    const sheets = this.xlsx.read(buffer, {type: 'buffer'});
    // console.log(`read sheets ${dump(sheets)}`);
    return sheets.Sheets[sheets.SheetNames[0]];
  }
}
