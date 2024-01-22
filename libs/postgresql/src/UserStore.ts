import {auditTableNames, datumToSql, sqlDate} from "./postgresql";
import _ from "lodash";
import {AuditStatusType, dateNow, NullableString, tracDateFormat} from "../../datatypes/src";
import {DateTime} from "luxon";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class UserStore {

    private insertUserSql: string;
    private updateUserSql: string;
  
    constructor(private schemaName: string) {
      this.insertUserSql = `INSERT INTO ${schemaName}.users ("username", "userpwd") VALUES(`;
      this.updateUserSql = `UPDATE ${schemaName}.users SET userpwd = `;
    }

    async createUser(user, client) {
        //console.log('Create user start.....');
        let sql = this.insertUserSql;
        //console.log(user);
        // if(user.length > 0) {
        //   sql += `${UserStore.userValues(user[0])};`;
        // }
        sql += `'${user.username}', '${user.userpwd}');`;
        //console.log(`sql for create User ${sql}`);
        
        return client.query(sql)
          .then(result => {
            // console.log('commit user stop');
            return result;
          })
          .catch(err => {
            throw new Error(`Mistake in '${sql}' caused ${err.message}`);
          });
    }

    async updatePwd(user, client) {
        let sql = this.updateUserSql;
        console.log(user);
        // if(user.length > 0) {
        //   sql += `${UserStore.userValues(user[0])};`;
        // }
        sql += `'${user.userpwd}' WHERE username = '${user.username}';`;
        //console.log(`sql for update password:  ${sql}`);
        
        return client.query(sql)
          .then(result => {
            // console.log('commit user stop');
            return result;
          })
          .catch(err => {
            throw new Error(`Mistake in '${sql}' caused ${err.message}`);
          });
    }

    private static userValues(n) {
        return `${datumToSql(n.username, 'string')},
        ${datumToSql(n.userpwd, 'string')})`;
    }

}


