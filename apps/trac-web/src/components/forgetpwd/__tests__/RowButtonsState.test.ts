import {RowButtonsState} from "../RowButtonsState";
import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

describe('RowButtonState', () => {
  let callback, buttons2, buttons3;
  beforeEach(() => {
    callback = jest.fn();
    buttons2 = [
      {
        state: false,
        title: 'Button 1',
        key: 'button1'
      },
      {
        state: false,
        title: 'Button 2',
        key: 'button2'
      },
    ];
    buttons3 = [
      {
        state: false,
        title: 'Button 1',
        key: 'button1'
      },
      {
        state: true,
        title: 'Button 2',
        key: 'button2'
      },
      {
        state: true,
        title: 'Button 3',
        key: 'button3'
      },
    ];
  });
  describe('constructor', () => {
    it('should set states in the parameterNames list to true', () => {
      const rbs = new RowButtonsState(buttons2, ['button2']);
      expect(rbs.buttonStates['button1'].state).toBeFalsy();
      expect(rbs.buttonStates['button2'].state).toBeTruthy();
    });
  });
  describe('getStates', () => {
    it('should return a states object based on button state', () => {
      const rbs = new RowButtonsState(buttons3);
      expect(rbs.getStatesMap()).toEqual({button1:false, button2:true, button3:true});
    });
  });
  describe('setButtonCallback', () => {
    it('should set the callback function', () => {
      const rbs = new RowButtonsState(buttons3);
      rbs.setButtonCallback(callback);
      expect(rbs.buttonCallback).toEqual(callback);
    });
    it('should set the states if specified', () => {
      const rbs = new RowButtonsState(buttons3);
      const expected = {button1:false, button2:false, button3:false};
      rbs.setButtonCallback(callback, expected);
      expect(rbs.getStatesMap()).toEqual(expected);
    });
  });
  describe('setStates', () => {
    it('should set the button states IAW the states parameter', () => {
      const rbs = new RowButtonsState(buttons3);
      const expected = {button1:false, button2:false, button3:false};
      rbs.setStates(expected);
      expect(rbs.getStatesMap()).toEqual(expected);
    });
    it('should call the callback function if present', () => {
      const rbs = new RowButtonsState(buttons3);
      rbs.setButtonCallback(callback);
      expect(callback).not.toBeCalled();
      rbs.setStates({button1:false, button2:false, button3:false});
      expect(callback).toBeCalled();
    });
  });
  describe('style', () => {
    it('should return the style of a button based on its state', () => {
      const rbs = new RowButtonsState(buttons3);
      expect(rbs.style('button1')).toMatchSnapshot();
      expect(rbs.style('button2')).toMatchSnapshot();
      expect(rbs.style('button3')).toMatchSnapshot();
    });
  });
  describe('parameters', () => {
    it('should return an array of all of the button names that are enabled', () => {
      const rbs = new RowButtonsState(buttons3);
      expect(rbs.getStatesArray()).toMatchSnapshot();
    });
  });
});
