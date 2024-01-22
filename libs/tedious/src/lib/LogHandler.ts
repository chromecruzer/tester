export default class LogHandler {
  monitor(emitter) {
    emitter.on('error', err => console.error(err));
    emitter.on('debug', msg => console.log(msg));
    emitter.on('info', msg => console.info(msg));
  }
}
