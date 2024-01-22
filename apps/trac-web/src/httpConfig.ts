import _ from "lodash";
import {prefix} from "@trac/datatypes";

console.log('window set env ', window['_env_']);
const port = _.has(window,'_env_.NX_API_PORT') ? window['_env_']['NX_API_PORT'] : '1234';
const host = _.has(window,'_env_.NX_API_HOST') ? window['_env_']['NX_API_HOST'] : 'localhost';
const protocol = `${port}` === '1234' ? 'http' : 'https'; //TODO: What a yucky hack.  Need a valid protocol decision.
const wsProtocol = `${port}` === '1234' ? 'ws' : 'wss'; //TODO: What a yucky hack.  Need a valid protocol decision.
export const httpRoot = `${protocol}://${host}:${port}/${prefix}`;
export const wsRoot = `${wsProtocol}://${host}:${port}`;
console.log(`http root is [${port}] ${httpRoot}`);

