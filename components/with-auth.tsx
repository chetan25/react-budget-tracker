import React, { Component } from 'react';
import Router from 'next/router';
import { Spin  } from 'antd';
import { ILoggedUser } from 'Components/interface';
import { userService } from 'Services/userService';

interface IProps {
    render: () => JSX.Element
}
interface IState {
    loggedUser: ILoggedUser|null;
    pageReady: boolean
}
const defaultUser:ILoggedUser|null = null;

class WithAuth extends Component<IProps, IState> {
    state: IState = {
        loggedUser: defaultUser,
        pageReady: false
    };

    componentDidMount = () => {
        userService.subscribe(
            (loggedUser: ILoggedUser) => {
                this.setState({loggedUser, pageReady: true})
            });
        userService.init();
    };

    renderChild = (): JSX.Element|null => {
        const { loggedUser } = this.state;
        if (!loggedUser && Router.route !== '/') {
            //hacky fix for the routing
            Router.push('/error', '/');

           return null;
        }
        // const { displayName = 'User', photoURL = null, email, uid } = loggedUser!;
        // const authUser: ILoggedUser = {
        //     displayName,
        //     photoURL,
        //     email,
        //     uid
        // };

        return (
            <div>{ this.props.render() }</div>
        );
    };

    render() {
        const { pageReady } = this.state;
        const contentClass = pageReady ? 'show' : '';
        if (!pageReady) {
            return (
                <div className='loading-spinner-center'>
                    <Spin size="large" />
                </div>
            )
        }

        return (
            <div className={`content-wrapper ${contentClass}`}>
                { this.renderChild() }
            </div>
        );
    }
}

export default WithAuth;