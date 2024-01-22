import TediousConfigFactory from "./TediousConfigFactory";
import mssql from 'mssql';
import LogHandler from "./LogHandler";

export default class TediousClient {
  private pool = null;
  private log: LogHandler;

  constructor(public config: TediousConfigFactory) {
  this.log = new LogHandler();
  }

  public async getRequest() {
    if (this.pool === null) {
      this.pool = new mssql.ConnectionPool({
        ...this.config.getConfig(),
        // debug: true,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          // debug: {
          //   packet: true,
          //   data: true,
          //   payload: true,
          //   token: true,
          //   log: true
          // }
        }
      });
      this.log.monitor(this.pool);
      await this.pool.connect();
    }
    const request = new mssql.Request(this.pool);
    this.log.monitor(request);
    return request;
  }

  public release(request) {
    console.log('disconnecting request');
    this.pool.release(request);

  }

  public disconnect() {
    const deadPool = this.pool;
    this.pool = null;
    deadPool.close();
  }

  public async throwError(stage, err, request) {
    this.release(request);
    return Promise.reject(Error(`${stage} produced an error ${err}`));
  }
}
