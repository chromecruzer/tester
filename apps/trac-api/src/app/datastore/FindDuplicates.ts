import _ from "lodash";
import {dataTableNames} from "@trac/datatypes";
import {PostgresClient, tryCatch} from "@trac/postgresql";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export class FindDuplicates {
  private getAllIolSql: string;
  private getExcludedSql: string;
  constructor(schemaName) {
    this.getAllIolSql = `SELECT * from ${schemaName}.${dataTableNames.iol} as iol
WHERE NOT description IN (SELECT prod.description FROM tracschema.products AS prod WHERE excluded = true);`
  }
  duplicates(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      const client = await postgresClient.getClient()
      const iols = await this.getAllIolQuery(client)
        .finally(async () => {
          console.log('trying to disconnect iol')
          return postgresClient.release(client);
        });
      // console.log(`iols ${dump(_.map(_.filter(iols, r => !_.isString(r.lot) || r.lot === ''), i => `${i.uuid} lot ${i.lot}`))}`);
      const lotMap = this.createMap(iols);
      // console.log(`lot map ${dump(_.keys(lotMap))}`);
      res.json(this.findDups(lotMap));
    })
  }
  private getAllIolQuery(client) {
    return client.query(this.getAllIolSql)
      .then(result => result.rows);
  }
   private createMap(records) {
    return _.reduce(records, (accum, r) => {
      if(!_.isString(r.lot) || r.lot === '') {
        console.log(`empty lot for record ${r.uuid} lot '${r.lot}'`);
        return accum;
      }
      if (_.isArray(accum[r.lot])) {
        accum[r.lot].push(r);
      } else {
        accum[r.lot] = [r];
      }
      return accum;
    },{});
  }
   private findDups(map) {
    return _.reduce(map, (accum, values, lot) => {
      if(values.length > 1 ) {
        accum.push(...values);
      }
      return accum;
    },[])
  }
}
