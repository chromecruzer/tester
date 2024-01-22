import {PostgresClient, AuditStore, tryCatch} from "@trac/postgresql";
import util from "util";
import {getDataFields, uploadHeaders} from "@trac/datatypes";
import {StatusCodes} from "http-status-codes";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class StoreAuditNoteOrItem {
  private storeAuditNoteSql: string;
  private auditStore: AuditStore;

  constructor(auditSchema) {
    this.auditStore = new AuditStore(auditSchema);
  }

  public storeNotes(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const notes = req.body;
      const client = await postgresClient.getClient();
      await this.auditStore.storeNotes(notes, client)
        .finally(() => {
          postgresClient.release(client);
        });
      res.status(StatusCodes.OK);
      res.send('OK')

    })
  }

  public updateItems(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const itemUuids = req.body[getDataFields.items];
      const auditMatch = req.body[getDataFields.match];
      const consignmentUuid = req.body[getDataFields.uuid] || null;
      const consignmentLocation = req.body[getDataFields.customerId] || null;
      const warehouse = req.body[getDataFields.warehouse] || null;
      const user = req.body[uploadHeaders.userField];
      const client = await postgresClient.getClient();
      await this.auditStore.updateItems(itemUuids, auditMatch, user, client, consignmentUuid, consignmentLocation, warehouse)
        .finally(() => {
          postgresClient.release(client);
        });
      res.status(StatusCodes.OK);
      res.send('OK')
    })
  }
  public updateAudit(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const uuid = req.body[getDataFields.uuid] || null;
      const status = req.body[getDataFields.auditStatus] || null;
      // console.log(`updating audit with ${dump(req.body)}, ${status}`);
      const client = await postgresClient.getClient();
      await this.auditStore.updateAudit(uuid, status, client)
        .finally(() => {
          postgresClient.release(client);
        });
      res.status(StatusCodes.OK);
      res.send('OK')
    })
  }

}
