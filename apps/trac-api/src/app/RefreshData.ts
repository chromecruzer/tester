import {
  ImportIntoConsignments,
  ImportIntoJumpTable,
  NotificationsServer,
  PostgresClient,
  SearchTable,
  tryCatch
} from "@trac/postgresql";
import {uploadHeaders} from "@trac/datatypes";
import {StatusCodes} from "http-status-codes";
import UploadManager from "./datastore/UploadManager";
import ScheduleBatches from "./emails/ScheduleBatches";

export default class RefreshData {
  private search: SearchTable;
  private consignments: ImportIntoConsignments;
  private salesJump: ImportIntoJumpTable;

  constructor(private schemaName, public uploadManager: UploadManager, private scheduler: ScheduleBatches,
              private ns = null as (NotificationsServer | null)) {
    this.search = new SearchTable(schemaName);
    this.consignments = new ImportIntoConsignments(schemaName, 'consignments', 'iol',
      'products');
    this.salesJump = new ImportIntoJumpTable(schemaName, 'salesjumptable', 'salesreps',
      'salesmappings');
  }

  private async clear(client) {
    if (this.ns) {
      this.ns.notify('INFO', `clear old data`,
        'removing search table', ['iolUpload'])
    }
    console.log('removing search table');
    await this.search.removeTable(client);
    if (this.ns) {
      this.ns.notify('INFO', `clear old data`,
        'removing consignments table', ['iolUpload'])
    }
    console.log('removing consignments table');
    await this.consignments.removeTable(client);
    if (this.ns) {
      this.ns.notify('INFO', `clear old data`,
        'removing sales jumps table', ['iolUpload'])
    }
    console.log('removing sales jumps table');
    await this.salesJump.removeTable(client);
  }

  private async refill(client) {
    if (this.ns) {
      this.ns.notify('INFO', `re-creating old data`,
        're-filling consignments table', ['iolUpload'])
    }
    console.log('re-filling consignments table');
    await this.consignments.into(client);
    await this.consignments.removeExcluded( client);
    if (this.ns) {
      this.ns.notify('INFO', `re-creating  old data`,
        're-filling sales jumps table', ['iolUpload'])
    }
    console.log('re-filling sales jumps table');
    await this.salesJump.fill(client);
    if (this.ns) {
      this.ns.notify('INFO', `re-creating old data`,
        're-filling search table', ['iolUpload'])
    }
    console.log('re-filling search table');
    await this.search.createTable(client);
    const tables = ['consignments', 'customers', 'products', 'salesreps'];
    for (const t of tables) {
      await this.search.fillTable(this.schemaName, t, client)
    }
  }

  public async refresh(client, user) {
    await this.clear(client);
    await this.refill(client);
    this.scheduler.clearMissingEmailAddresses();
    return this.uploadManager.markRefresh(user);
  }

  public refreshHttp(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const user = req.body[uploadHeaders.userField];
      if (this.ns) {
        this.ns.started(['iolUpload']);
      }
      const client = await postgresClient.getClient()
      await this.refresh(client, user)
        .finally(async () => {
          return postgresClient.release(client);
        });
      this.uploadManager.markRefresh(user);
      res.status(StatusCodes.OK);
      if (this.ns) {
        this.ns.completed(['iolUpload']);
      }
      res.send('OK')
    })
  }
}
