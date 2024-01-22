import {PostgresClient, PostgresConfigFactory, UserStore, tryCatch} from "@trac/postgresql";
import {getDataFields} from "@trac/datatypes";
import util from "util";
import {StatusCodes} from "http-status-codes";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class UserOps {
  //searchTable: SearchTable;
  tableName: string;
  selectSql: string;
  private userStore: UserStore;

  constructor(private postgresConfig: PostgresConfigFactory, usersTable: string) {
    //this.searchTable = new SearchTable(postgresConfig.getSchemaName());
    this.userStore = new UserStore(postgresConfig.getSchemaName());
    this.tableName = `${postgresConfig.getSchemaName()}.${usersTable}`;
    this.selectSql = `SELECT * FROM ${this.tableName}`;
  }

  public getUsers(postgresClient: PostgresClient) {
    return tryCatch(async(req, res, next) => {
      
      const client = await postgresClient.getClient();
      const uuid = req.params[getDataFields.uuid] || null;
      const username = req.params[getDataFields.username] || null;

      const results = await this.queryUsers(client, uuid, username)
          .finally(async () => {
            console.log('trying to disconnect consignment')
            return postgresClient.release(client);
          });
        res.json(results.rows);

    })

  }
  
  public async queryUsers(client, uuid: (string | null) = null, username: (string | null) = null) {
    let sql = this.selectSql;
    let lcWhere = ' WHERE ';
    //console.log("username = " + username);

    if(uuid) {
      sql += ` ${lcWhere} uuid='${uuid}'`;
      lcWhere = ' AND ';
    }

    if(username) {
      sql += ` ${lcWhere} username = '${username}'`;
      console.log("username = " + username);
    }

    sql +=';';

    //console.log("sql4 = " + sql);
    return client.query(sql).catch(err => {
      throw new Error(`Mistake in '${sql}' caused ${err.message}`);
    });
  }

  public createUser(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const client = await postgresClient.getClient();
      const user = req.body;
   
      await this.userStore.createUser(user, client)
      .finally(() => {
        postgresClient.release(client);
      });
      res.status(StatusCodes.OK);
      res.send('OK')
   
    })
   }
  
   public updatePwd(postgresClient: PostgresClient) {
    return tryCatch(async (req, res, next) => {
      const client = await postgresClient.getClient();
      const user = req.body;
   
      await this.userStore.updatePwd(user, client)
      .finally(() => {
        postgresClient.release(client);
      });
      res.status(StatusCodes.OK);
      res.send('OK')
   
    })
   }







}
