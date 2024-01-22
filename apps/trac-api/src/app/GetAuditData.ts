import {auditTableNames, PostgresClient, PostgresConfigFactory, tryCatch} from "@trac/postgresql";
import {getDataFields} from "@trac/datatypes";
import * as util from "util";
import _ from "lodash";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class GetAuditData {
  private getAuditsSql: string;
  private getAuditItemsSql: string;
  private getAuditNotesSql: string;
  private getAuditsWithNameOnlySql: string;

  constructor(private postgresConfig: PostgresConfigFactory, customerTable: string) {
    this.getAuditsWithNameOnlySql = `SELECT audit.*, customer.name as location
FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.locations} AS audit
JOIN ${postgresConfig.getSchemaName()}.${customerTable} AS customer ON audit.location_code = customer.customer_code`;
    this.getAuditsSql = `SELECT * FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.locations} AS audit`;
    this.getAuditItemsSql = `SELECT * FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.items}`;
    this.getAuditNotesSql = `SELECT * FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.notes}`;
  }

  public getAuditLocations(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const customerId = req.query[getDataFields.customerId] || null;
      const auditUuid = req.query[getDataFields.uuid] || null;
      const status = req.query[getDataFields.auditStatus] || null;
      const withName = req.query[getDataFields.withName] || false;
      const client = await postgresClient.getClient();
      const results = await this.queryAudits(client, customerId, auditUuid, status, withName)
        .finally(async () => {
          return postgresClient.release(client);
        });
      res.json(results);
    })
  }

  public getOpenAudits(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const client = await postgresClient.getClient();
      const audits = await this.queryAudits(client, null, null, ['OPEN', 'CHECKIN'],
        true);
      // console.log(`open audits ${dump(audits)}`);
      if (_.isEmpty(audits)) {
        await postgresClient.release(client);
        res.json([]);
        return;
      }
      const itemsMap = await this.queryAuditItems(client, null, _.map(audits, a => a.uuid))
        .then(items => _.reduce(items, (accum, i) => {
          if (_.isUndefined(accum[i.audit_uuid])) {
            accum[i.audit_uuid] = [];
          }
          accum[i.audit_uuid].push(i);
          return accum;
        }, {}))
        .finally(async () => {
          return postgresClient.release(client);
        });
      ;
      _.forEach(audits, a => {
        a.unresolved = _.isArray(itemsMap[a.uuid]) ? itemsMap[a.uuid].length : null;
      })
      res.json(audits);
    });
  }

  public getAudit(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const auditUuid = req.query[getDataFields.uuid] || null;
      const client = await postgresClient.getClient();
      const location = await this.queryAudits(client, null, auditUuid, null, true)
        .then(results => results[0]);
      const resultItems = await this.queryAuditItems(client, auditUuid)
      const resultNotes = await this.queryAuditNotes(client, auditUuid)
        .finally(async () => {
          return postgresClient.release(client);
        });
      console.log(`returning audit ${auditUuid} location ${dump(location)}
      items ${resultItems.length} notes ${resultNotes.length}`);
      res.json({
        location,
        items: resultItems,
        notes: resultNotes,
      });
    })
  }

  public async queryAudits(client, customerId, auditUuid, status, nameOnly) {
    let sql = nameOnly ? this.getAuditsWithNameOnlySql : this.getAuditsSql;
    switch (true) {
      case customerId !== null:
        sql += ` WHERE audit.location_code='${customerId}'`;
        break;
      case auditUuid !== null:
        sql += ` WHERE audit.uuid='${auditUuid}'`;
        break;
      case _.isArray(status):
        sql += ` WHERE audit.status IN (${ _.join(_.map(status, s => `'${s}'`))})`;
        break;
      case status !== null:
        sql += ` WHERE audit.status='${status}'`;
        break;

    }
    sql += ';';
    console.log("line no 107...............")
    console.log(`query audits "${sql}"`);
    return client.query(sql)
      .then(result => result.rows)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${dump(err)}`);
      });
  }

  public async queryAuditItems(client, auditUuid, auditUuids = null) {
    let sql = this.getAuditItemsSql;
    if (auditUuid) {
      sql += ` WHERE audit_uuid='${auditUuid}'`;
    }
    if (auditUuids) {
      sql += ` WHERE audit_uuid IN (${_.join(_.map(auditUuids, a => `'${a}'`))})`;
    }
    sql += ';';
    // console.log(`item query '${sql}'`)
    return client.query(sql)
      .then(result => result.rows)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${dump(err)}`);
      });
  }

  private async queryAuditNotes(client, auditUuid) {
    let sql = this.getAuditNotesSql;
    if (auditUuid) {
      sql += ` WHERE audit_uuid='${auditUuid}'`;
    }
    sql += ';';
    return client.query(sql)
      .then(result => result.rows)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${dump(err)}`);
      });
  }
}
