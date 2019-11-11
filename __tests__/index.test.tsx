import { mount } from 'enzyme';
import Index from 'Pages/index';

jest.mock('firebase-settings', () => new Promise(resolve => resolve(true)));

describe('Pages', () => {
   it('should render without throwing an error', function () {
      const wrap = mount(<Index/>);
      expect(wrap.find('div.content').text()).toBe('LogIn')
   });
});