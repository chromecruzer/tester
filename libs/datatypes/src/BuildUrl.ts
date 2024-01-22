import _ from 'lodash';

export default class BuildUrl {
  constructor(private host: (string | null) = null, private port: (string | null) = null) {

  }

  public build(path: string, paths: string[] = [], params = {}) {
    let result = `${this.prefix()}${path}`;
    let firstDelimiter = true;
    paths.forEach(p => {
      result += `${firstDelimiter ? '/' : ''}${p}`;
      firstDelimiter = true;
    });
    if (_.isEmpty(params)) {
      return result;
    }
    // console.log(`result so far "${result}" last char is ${_.last(result)}`)
    result += _.last(result) === '/' ? '?' : '/?';
    firstDelimiter = false;
    _.forEach(params, (value, key) => {
      if (!_.isArray(value)) {
        result += `${firstDelimiter ? '&' : ''}${key}=${value}`;
        firstDelimiter = true;
        return;
      }
      _.forEach(value, v => {
        result += `${firstDelimiter ? '&' : ''}${key}=${v}`;
        firstDelimiter = true;
      });
      // console.log(`result after param ${key}=${value} ${result}`);
    });
    return result;
  }

  private prefix() {
    switch (true) {
      case this.host !== null && this.port !== null:
        return `${this.host}:${this.port}/`;
      case this.host !== null:
        return `${this.host}/`;
      default:
        return '';
    }
  }
}
