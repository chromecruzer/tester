import AutoCompleteDebouncer from "../AutoCompleteDebouncer";

describe('AutoCompleteDebouncer', () => {
  let funcToCall;
  beforeEach(() => {
    jest.useFakeTimers();
    funcToCall = jest.fn();
    jest.spyOn(global, 'setTimeout');

  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('set', () => {
    it('should set an execute function for some time in the future', () => {
      const debouncer = new AutoCompleteDebouncer(5000);
      debouncer.set(funcToCall, 'test function');
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 5);
      jest.runAllTimers();
      expect(funcToCall).toHaveBeenCalled();
    });
    it('should set the delay timer according to an incoming factor', () => {
      const debouncer = new AutoCompleteDebouncer(5000);
      debouncer.set(funcToCall, 'test function',5);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });
  });
  describe('clear', () => {
    it('should remove a timer before it executes', () => {
      const debouncer = new AutoCompleteDebouncer(5000);
      debouncer.set(funcToCall, 'test function');
      debouncer.clear();
      jest.runAllTimers();
      expect(funcToCall).not.toHaveBeenCalled();
    });
  });
});
