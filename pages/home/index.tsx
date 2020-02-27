import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { ILoggedUser } from 'Components/interface';
import { userService } from 'Services/userService';
import { Spin } from 'antd';

const WithAuth = dynamic(
    () => import('Components/with-auth'),
    { ssr: false }
);
const HomeComponent = dynamic(
    () => import('Components/home-component'),
    { ssr: false }
);
import 'Assets/default-theme.less';
// import moment from 'moment';

interface IState {
    loggedUser: ILoggedUser;
}

class Home extends Component {
    state: IState = {
        loggedUser: {
            uid: '',
            displayName: null,
            photoURL: null,
            email: null
        },
    };

    componentDidMount = () => {
        userService.subscribe((loggedUser: ILoggedUser) => { this.setState({loggedUser}) });
        userService.init();
        history.pushState(null, 'test', location.href);
        window.onpopstate = function () {
            history.go(1);
        };
    };
    renderHome = () => {
        const { loggedUser } = this.state;
        const { displayName } = loggedUser;
        if (!displayName) {
            return (
                <Spin size="large" />
            );
        }
        return (
            <div>
                 <HomeComponent loggedUser={loggedUser}/>
            </div>
        );
    };

    render() {
        return (
            <WithAuth render={() => this.renderHome()}></WithAuth>
        );
    }
}

export default Home;