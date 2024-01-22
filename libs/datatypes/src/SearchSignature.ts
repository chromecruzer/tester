import _ from "lodash";

const dump = obj => JSON.stringify(obj, null, 2);

export interface SignatureFields {
  searchFields: string[];
  type: string;
  idFieldFn: () => string;
}

export default class SearchSignature {
  constructor(private signatureFields: SignatureFields) {
  }

  createSearchRecord(row, text) {
    let field = null;
    const result = {uuid: row.uuid, field, type: this.signatureFields.type,
      consignment_id: row[this.signatureFields.idFieldFn()], signature: {}};

    this.signatureFields.searchFields.forEach(f => {
      if (_.includes(_.toLower(row[f]), _.toLower(text))) {
        field = row[f];
      }
      result.signature[f] = row[f];
    });
    result.field = field;
    // console.log(`convert ${dump(row)} for text ${text}`, result);
    return result;
  }
  getSearchFields() {
    return this.signatureFields.searchFields;
  }
}
