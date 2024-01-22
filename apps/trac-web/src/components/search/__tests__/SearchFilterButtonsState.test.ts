import {RowButtonsState} from "../RowButtonsState";
import SearchFilterButtonsState from "../SearchFilterButtonsState";

describe('SearchFilterButtonsState', () => {
  describe('reduxFilter', () => {
    let buttons2, buttons3;
    beforeEach(() => {
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
    it('should format the button states into a states object if any buttons are true', () => {
      const rbs = new SearchFilterButtonsState(buttons3, [], ['button1', 'button2']);
      expect(rbs.reduxFilter()).toMatchSnapshot();

    });
    it('should return the defaultStates if nothing is true', () => {
      const rbs = new SearchFilterButtonsState(buttons2, [], ['button1', 'button2'], {thisisadefaultstate: true});
      expect(rbs.reduxFilter()).toMatchSnapshot();
    });
  });
});
