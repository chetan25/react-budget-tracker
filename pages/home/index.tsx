import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { ILoggedUser } from 'Components/interface';
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

class Home extends Component {
    renderHome = (loggedUser: ILoggedUser) => {
        console.log(loggedUser);
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
            <WithAuth render={(loggedUser) => this.renderHome(loggedUser)}></WithAuth>
        );
    }
}

export default Home;