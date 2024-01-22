import {getDataFields} from "@trac/datatypes";
import {tryCatch} from "@trac/postgresql";
import util from "util";
const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class DownloadPdf {
  constructor(private apiConfig, private generatePdf, private createEmail) {
  }
  public getPdf(isExpired) {
    return tryCatch(async (req, res, next) => {
      const accountId = req.body[getDataFields.customerId] || null;
      const auditUuid = req.body[getDataFields.uuid] || null;
      const date = req.body[getDataFields.date];
      let filename;
      const tableName = await this.createEmail.getTitle({accountId, auditUuid, date,
        templateType: (isExpired ? 'Expired' : 'Missing')}, 'TableName')
      if(isExpired) {
        filename = await this.generatePdf.generateExpired(accountId, date, tableName);
      } else {
        filename = await this.generatePdf.generateMissing(auditUuid, tableName);
      }
      res.download(filename);
    })
  }

}
