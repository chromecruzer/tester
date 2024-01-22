import {auditTableNames, datumToSql, sqlDate} from "./postgresql";
import _ from "lodash";
import {AuditStatusType, dateNow, NullableString, tracDateFormat} from "../../datatypes/src";
import {DateTime} from "luxon";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class AuditStore {
  private insertNotesSql: string;
  private updateItemSql: string;
  private updateAuditSql: string;
  constructor(private schemaName: string) {
    this.insertNotesSql = `INSERT INTO ${schemaName}.${auditTableNames.notes} VALUES `;
    this.updateItemSql = `UPDATE ${schemaName}.${auditTableNames.items} SET `;
    this.updateAuditSql = `UPDATE ${schemaName}.${auditTableNames.locations} SET `;
  }
  async storeNotes(notes, client) {
    // console.log('commit notes start');
    let sql = this.insertNotesSql;
    if(notes.length > 1) {
      const values = _.map(notes, n => `${AuditStore.noteValues(n)}`);
    sql += `${_.join(values, ',\n')};`
    } else {
      sql += `${AuditStore.noteValues(notes[0])};`;
    }
    // console.log(`sql for create Note ${sql}`);
    return client.query(sql)
      .then(result => {
        // console.log('commit notes stop');
        return result;
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
  private static noteValues(n) {
    return `(gen_random_uuid(),
    ${datumToSql(DateTime.fromFormat(n.date_created,tracDateFormat).toJSDate(), 'date')},
    ${datumToSql(n.author, 'string')},
    ${datumToSql(n.annotate_type, 'string')},
    ${datumToSql(n.annotated_uuid, 'string')},
    ${datumToSql(n.audit_uuid, 'string')},
    ${datumToSql(n.content, 'string')})`;
  }
  async updateItems(uuids, audit_match, user, client, consignment_uuid = null, consignment_location = null,
                    warehouse = null as NullableString) {
    // console.log(`update items match ${audit_match} for ${user}
    // moved to ${consignment_uuid} ${consignment_location} uuids ${dump(uuids)}`)
    let sql = this.updateItemSql;
    sql += `audit_match = '${audit_match}'`;
    if(consignment_location && consignment_uuid && warehouse) {
      sql += `, consignment_uuid = '${consignment_uuid}', consignment_location = '${consignment_location}',
      consignment_warehouse = '${warehouse}', confirmed_date = '${sqlDate(dateNow())}', confirmed_by = '${user}' `;
    }
    if(uuids.length > 1) {
      sql += ` WHERE uuid IN (${_.join(_.map(uuids, u => `'${u}'`), ',')});`
    } else {
      sql += ` WHERE uuid='${uuids[0]}';`
    }
    // console.log(`sql for update Item ${sql}`);
    return client.query(sql)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
  async updateAudit(uuid, status: AuditStatusType, client) {
    let sql = this.updateAuditSql;
    sql += `status = '${status}'`;
    sql += ` WHERE uuid='${uuid}';`
    // console.log(`sql for update Item ${sql}`);
    return client.query(sql)
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
}
