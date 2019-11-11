import { mount } from 'enzyme';
import WithAuth from 'Components/with-auth';
import Router from 'next/router';
import { UserContext } from 'Providers/user-provider';

jest.mock('next/router', ()=> ({push: jest.fn()}));
jest.mock('firebase-settings', () => new Promise(resolve => resolve(true)));

describe('Should call route change when no logged user', () => {
    it('should render without throwing an error', function () {
        // @ts-ignore
        UserContext.Consumer = jest.fn((props: any) => props.children({}));
        mount(<WithAuth><div>In Home</div></WithAuth>);
        expect(Router.push).toHaveBeenCalledWith("/error", "/")
    });
});

describe('Should render component when logged user', () => {
    it('should render without throwing an error', function () {
        // @ts-ignore
        UserContext.Consumer = jest.fn((props: any) => props.children({id: 3434}));
        const wrap =  mount(<WithAuth><div className="content">In Home</div></WithAuth>);
        expect(wrap.find('div.content').text()).toBe('In Home')
    });
});