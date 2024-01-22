import {prefix} from "./datatypes";
import {ReadyState} from "react-use-websocket";

export type LevelTypes = ('DEBUG' | 'LOG' | 'INFO' | 'WARN' | 'FATAL');
export type NotificationMessageType = ('CONTENT' | 'CLOSE_COMMAND' | 'NOTIFY_STARTED' | 'NOTIFY_COMPLETED');
export interface NotificationMessage {
  messageType: NotificationMessageType;
}
export interface NotificationContentMessage extends NotificationMessage {
  level: LevelTypes;
  tags: NotifyPathType[];
  title: string;
  content?: string;
}
export type NotifyPathType = ('iolUpload');
export const notifyPaths = {
  iolUpload: `/${prefix}/upload/iol_report/notify`
}
export const connectionStatus = {
  [ReadyState.CONNECTING]: 'Connecting',
  [ReadyState.OPEN]: 'Open',
  [ReadyState.CLOSING]: 'Closing',
  [ReadyState.CLOSED]: 'Closed',
  [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
};
