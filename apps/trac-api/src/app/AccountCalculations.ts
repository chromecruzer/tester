import _ from "lodash";
import {auditTableNames, queryRecords, tryCatch} from "@trac/postgresql";
import {
  addAuditToCustomer,
  AuditLocationRecord,
  CustomerRecord,
  ExpirationCalculations,
  getDataFields,
  LatestAudit, unresolvedAuditItem
} from "@trac/datatypes";
import {DateTime} from "luxon";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

interface AuditMap {
  [id: string]: AuditLocationRecord[]
}

export default class AccountCalculations {
  private getConsignmentsSql: string;
  private getAuditsSql: string;
  private getMappingsSql: string;
  private getCustomersSql: string;
  private getAuditItemsSql: string;

  constructor(private postgresConfig, private consignmentTable, private customersTable, private salesJumpTable) {
    this.getConsignmentsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${consignmentTable}
WHERE customer_id IN `;
    this.getAuditsSql = `SELECT * FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.locations}
WHERE location_code IN`;
    this.getCustomersSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${customersTable}`;
    this.getMappingsSql = `SELECT * FROM ${postgresConfig.getSchemaName()}.${salesJumpTable}`;
    this.getAuditItemsSql = `SELECT * FROM ${postgresConfig.getAuditSchemaName()}.${auditTableNames.items}`;
  }

  public getAccountCalculations(postgresClient, needAuditData) {
    return tryCatch(async (req, res, next) => {
      const uuid = req.body[getDataFields.uuid] || null;
      const date = req.body[getDataFields.date] || null;
      const client = await postgresClient.getClient();
      const sql = `${this.getMappingsSql} WHERE salesrep_uuid = '${uuid}';`;
      const accountIds = await client.query(sql)
        .then(data => _.map(data.rows, r => r.customer_id))
        .catch(err => {
          throw new Error(`Mistake in '${sql}' caused ${err.message}`);
        });
      const accounts = await queryRecords(client, this.getCustomersSql, 'customer_code',
        {ids: accountIds});
      // console.log(`Got ${accounts.length} accounts from ${uuid}`)
      const results = await this.accountTotals(client, accounts, date, needAuditData)
        .finally(async () => {
          console.log('trying to disconnect account calculations')
          return postgresClient.release(client);
        });
      res.json(results);
    });
  }

  public async accountTotals(client, accounts, date, needAuditDate) {
    const amap = this.accountMap(accounts);
    const consignmentMap = await this.groupedAccountConsignments(client, _.keys(amap));
    let latestAudits = {};
    const totalWorth = _.reduce(_.keys(amap), (accum, a) => {
      accum[a] = this.totalWorthConsignments(consignmentMap[a]);
      return accum;
    }, {})
    const expired = _.reduce(_.keys(amap), (accum, a) => {
      accum[a] = this.totalExpired(consignmentMap[a], date);
      return accum;
    }, {})
    if (needAuditDate) {
      const auditMap = await this.groupedAccountAudits(client, _.keys(amap));
      // console.log(`audit map ${dump(auditMap)}`);
      latestAudits = _.reduce(_.keys(amap), (accum, a) => {
        if(auditMap[a]) {
          accum[a] = this.findLatestAudit(auditMap[a]);
        }
        return accum;
      }, {} as { [id: string]: LatestAudit });
      // console.log(`latest audits ${dump(_.map(latestAudits, (la: LatestAudit) =>
      //   ({uuid: la?.uuid, status: la?.status, date: la?.date})))}`);
      const openAuditUuids = _.reduce(latestAudits, (accum, la: LatestAudit) => {
        if(la?.status === 'OPEN') {
          accum.push(la.uuid);
        }
        return accum;
      }, []);
      // console.log(`open audit uuids ${openAuditUuids}`);
      if(!_.isEmpty(openAuditUuids)) {
        const groupedAuditItems = await this.groupUnresolved(client, openAuditUuids);
        _.forEach(openAuditUuids, oau => {
          if(latestAudits[oau]) {
            latestAudits[oau].unresolved = this.totalUnresolved(groupedAuditItems[oau]);
          }
        });
      }
    }
    return _.reduce(amap, (accum, account, code) => {
      let accountCalcs = {...account};
      // console.log(`calculations ${dump(totalWorth)} ${dump(expired)}`)
      accountCalcs['totalValue'] = totalWorth[code];
      accountCalcs['totalExpired'] = expired[code];
      if (needAuditDate && latestAudits[code]?.uuid) {
        accountCalcs = addAuditToCustomer(accountCalcs, latestAudits[code]);
      }
      // console.log(`audit data for ${code} needed ${needAuditDate} uuid ${latestAudits[code]?.uuid}`)
      accum.push(accountCalcs);
      // console.log(`totals: ${dump(accum)}`)
      return accum;
    }, []);
  }

  private accountMap(accounts): { [id: string]: CustomerRecord } {
    return _.reduce(accounts, (accum, a) => {
      accum[a.customer_code] = a;
      return accum;
    }, {})
  }

  private totalWorthConsignments(consignments) {
    return _.reduce(consignments, (accum, c) => {
      accum += Number.parseInt(c.unit_price);
      return accum;
    }, 0)
  }

  private findLatestAudit(locations: AuditLocationRecord[]) {
    // console.log(`converting latest audit locations ${dump(locations)}`)
    return _.reduce(locations, (accum, a) => {
      // console.log(`converting latest audit to candidate ${dump(a)}`)
      const candidate = {
        uuid: a.uuid,
        status: a.status,
        date: a.close_date || a.received_date,
        dateTime: a.close_date ? DateTime.fromJSDate(new Date(a.close_date))
          : DateTime.fromJSDate(new Date(a.received_date)),
      }
      // console.log(` comparing candidate ${candidate.dateTime} to accum ${accum?.dateTime}
      // comparison ${accum?.dateTime > candidate.dateTime}`);
      if(accum === null) {
        return candidate;
      }
      if(accum.dateTime > candidate.dateTime) {
        return candidate;
      }
      return accum;
    }, null);
  }
  private totalUnresolved(items) {
    const result = _.filter(items, i => unresolvedAuditItem(i));
    return result.length;
  }
  private async groupUnresolved(client, openUuids: string[]) {
    let sql = this.getAuditItemsSql;
    sql += ' WHERE audit_uuid IN (';
    sql += _.join(_.map(openUuids, ou => `'${ou}'`), ',');
    sql += ');'
    return client.query(sql)
      .then(response => {
        // console.log(`response ${dump(response)}`);
        if(_.isArray(response.rows)) {
          return _.groupBy(response.rows, r => r.audit_u)
        }
        return {}
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }

  private totalExpired(consignments, date) {
    const calc = new ExpirationCalculations(date);
    const expired = _.filter(consignments, c => {
      const e = calc.chooseBucket(c);
      return e === 'Too Late';
    });
    return expired.length || 0;
  }

  private async groupedAccountConsignments(client, accountIds) {
    const sql = `${this.getConsignmentsSql} (${_.join(_.map(accountIds, id => `'${id}'`), ',')});`;
    return client.query(sql)
      .then(response => {
        if(_.isArray(response.rows)) {
          return _.groupBy(response.rows, r => r.customer_id)
        }
        return {}
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });

  }

  private async groupedAccountAudits(client, accountIds): Promise<AuditMap> {
    const sql = `${this.getAuditsSql} (${_.join(_.map(accountIds, id => `'${id}'`), ',')});`;
    return client.query(sql)
      .then(response => {
        if(_.isArray(response.rows)) {
          return _.groupBy(response.rows, r => r.location_code)
        }
        return {}
      })
      .catch(err => {
        throw new Error(`Mistake in '${sql}' caused ${err.message}`);
      });
  }
}
