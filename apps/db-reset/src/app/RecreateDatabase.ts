import {Client} from "pg";
import {PostgresConfigFactory} from "@trac/postgresql";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class RecreateDatabase {
  private client: Client;
  private dbExistsSql;
  private dbCreateDbSql;
  private dbDropSchemaSql;
  private dbaseName;
  public recreate: () => (Promise<null>);
  public disconnect: () => (Promise<any>);
  private dbDropDbSql: string;
  private schemaExistsSql: string;

  constructor(private config: PostgresConfigFactory, private deleteDb = false) {
    this.client = new Client(deleteDb ? config.getRootConfig() : config.getTracConfig());
    this.dbExistsSql = `select exists (SELECT datname FROM pg_catalog.pg_database
WHERE lower(datname) = lower('${config.getDbName()}'));`;
    this.schemaExistsSql = `SELECT EXISTS(SELECT 1 FROM information_schema.schemata
WHERE schema_name = '${config.getSchemaName()}');`
    this.dbCreateDbSql = `CREATE DATABASE ${config.getDbName()};`;
    this.dbDropDbSql = `DROP DATABASE ${config.getDbName()};`;
    this.dbDropSchemaSql = `DROP SCHEMA IF EXISTS ${config.getSchemaName()} CASCADE;`;
    console.log(`deleting ${this.deleteDb ? 'everything' : 'only the data'} from ${this.deleteDb}`);
    this.recreate = this.deleteDb ? this.recreateDb.bind(this) : this.dropSchema.bind(this);
    this.disconnect = async () => this.client.end();
  }

  public connect() {
    return this.client.connect();
  }

  private async dropSchema() {
    return this.client.query(this.dbDropSchemaSql).then(() => {
      // console.log(`${this.config.getSchemaName()} dropped with ${this.dbDropSchemaSql}`)
      console.log(`${this.config.getSchemaName()} dropped`)
    }).catch(err => {
      console.error(`problem dropping schema`, err);
    });
  }

  private async recreateDb() {
    const exists = (await this.client.query(this.dbExistsSql)).rows[0].exists;
    console.log(`${this.config.getDbName()} ${(exists ? 'exists' : 'does not exist')}`);
    if (exists) {
      await this.client.query(this.dbDropDbSql).then(() => {
        console.log(`${this.config.getDbName()} dropped`)
      }).catch(err => {
        console.error(`problem dropping database`, err);
      });
    }
    return await this.client.query(this.dbCreateDbSql).then(() => {
      console.log(`database ${this.config.getDbName()} created`)
    }).catch(err => {
      console.error('database creation failed', err);
    })
  }
}
