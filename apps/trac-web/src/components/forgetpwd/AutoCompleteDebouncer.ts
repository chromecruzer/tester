export default class AutoCompleteDebouncer {
  private timer;
  private label;
  static createInstance(delay = 1000) {
    return new AutoCompleteDebouncer(delay)
  }
  constructor(private delay) {
    this.timer = null;
    this.label = null;
  }
  set(func, label, factor = 1) {
    const timerFunc = func;
    if(this.timer !== null) {
      // console.log('timer needs to be cleared first');
      this.clear();
    }
    this.label = label;
    this.timer = setTimeout(() => {
      console.log('executing timer', label);
      timerFunc();
      this.clear();
    }, this.delay/factor);
    console.log('set timer', this.label);
  }
  clear() {
    console.log('clearing timer', this.label);
    clearTimeout(this.timer);
    this.timer = null;
    this.label = null;
  }
}
