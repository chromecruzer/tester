import {auditTableNames, PostgresClient, PostgresConfigFactory} from "@trac/postgresql";
import {getDataFields} from "@trac/datatypes";
import * as util from "util";
import { tryCatch } from '@trac/postgresql';
import {StatusCodes} from "http-status-codes";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class RemoveAudit {
  private deleteAuditsSql: string;
  private deleteAuditItemsSql: string;
  private deleteAuditNotesSql: string;
  private getAuditsWithNameSql: string;
  constructor(private postgresConfig: PostgresConfigFactory) {
    this.deleteAuditsSql = `DELETE FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.locations} AS audit`;
    this.deleteAuditItemsSql = `DELETE FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.items}`;
    this.deleteAuditNotesSql = `DELETE FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.notes}`;
  }
  public removeAudit(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      const auditUuid = req.query[getDataFields.uuid] || null;
        const client = await postgresClient.getClient();
        console.log('removing audit items');
      await this.removeAuditItems(client, auditUuid)
      console.log('removing audit notes');
      await this.removeAuditNotes(client, auditUuid)
      console.log('removing audit summary');
      await this.removeAuditLocation(client, auditUuid)
          .finally(async () => {
            return postgresClient.release(client);
          });
      res.status(StatusCodes.OK);
      res.send('OK')
    })
  }

  private async removeAuditLocation(client, auditUuid) {
    let sql = this.deleteAuditsSql;
    if(auditUuid) {
      sql += ` WHERE audit.uuid='${auditUuid}';`;
    }
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${dump(err)}`);
    });
  }
  private async removeAuditItems(client, auditUuid) {
    let sql = this.deleteAuditItemsSql;
    if(auditUuid) {
      sql += ` WHERE audit_uuid='${auditUuid}'`;
    }
    sql +=';';
    // console.log(`item query '${sql}'`)
     return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${dump(err)}`);
    });
  }

  private async removeAuditNotes(client, auditUuid) {
    let sql = this.deleteAuditNotesSql;
    if(auditUuid) {
      sql += ` WHERE audit_uuid='${auditUuid}'`;
    }
    sql +=';';
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${dump(err)}`);
    });
  }
}
