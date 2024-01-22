import util from "util";
import _ from "lodash";
import {NotifyPathType, NullableString} from "../../datatypes/src";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export default class NotificationsServer {
  private webSockets: { [id: string]: WebSocket[] }

  constructor() {
    this.webSockets = {}
  }

  private add(notifyPath, ws) {
    if (!_.isArray(this.webSockets[notifyPath])) {
      this.webSockets[notifyPath] = [];
    }
    this.webSockets[notifyPath].push(ws);
  }

  private remove(notifyPath, ws) {
    this.webSockets[notifyPath] = _.remove(this.webSockets[notifyPath], ws);
  }

  controlMessage(notifyPath: NotifyPathType) {
    return (ws, req, next) => {
      console.log(`ws connection request`);
      this.add(notifyPath, ws);
      ws.on('message', msg => {
        console.log(`received ws message ${dump(msg)}`);
        if (msg.type === 'COMMAND_CLOSE') {
          this.remove(notifyPath, ws);
          ws.close();
        }
      });
      ws.on('close', () => {
        console.log('ws socket disconnected');
        this.remove(notifyPath, ws);
        ws.close();
      });
      // ws.send('ws test message')
    }
  }

  notify(level, title, content = null as NullableString, tags: NotifyPathType[]) {
    const message = {messageType: 'CONTENT', level, title, content, tags};
    this.send(message, tags)
  }

  started(tags) {
    const message = {messageType: 'NOTIFY_START'};
    this.send(message, tags)
  }

  completed(tags) {
    const message = {messageType: 'NOTIFY_COMPLETED'};
    this.send(message, tags)
  }

  private send(message, tags: NotifyPathType[]) {
    // console.log(`notifying with ${dump(message)}`);
    _.forEach(tags, t => {
      _.forEach(this.webSockets[t], c => {
        // console.log(`sending content ${dump(message)}`);
        c.send(JSON.stringify(message))
      })
    })
  }
}
