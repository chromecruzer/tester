import * as fs from 'fs-extra';
import {TediousTables} from "./tedious";

export interface TediousConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  productsTable: string;
  customersTable: string;
  mappingsTable: string;
  salesRepsTable: string;
}

export default class TediousConfigFactory {
  constructor(public config: TediousConfig) {
  }
  public static async load(filepath) {
    const config = await fs.readJSON(filepath);
    return new TediousConfigFactory(config);
  }
  public getConfig() {
    const {user, password, server, database} = this.config;
    return {user, password, server, database};
  }
  public getTablePath(table: TediousTables) {
    return this.config[`${table}Table`]
  }

  getDatabase() {
    return this.config.database;
  }
}
