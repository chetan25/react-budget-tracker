import React, { Component } from 'react';
import Router from 'next/router';
import { auth } from "Root/firebase-settings";
import { Spin  } from 'antd';
import { ILoggedUser } from 'Components/interface';

interface IProps {
    render: (loggedUser: ILoggedUser) => JSX.Element
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
    unSubscribeAuth: firebase.Unsubscribe|null = null;

    componentDidMount = () => {
        let loggedUser: ILoggedUser|null;
        if(localStorage.getItem('authUser')) {
            // @ts-ignore
            loggedUser = JSON.parse(localStorage.getItem('authUser'));
            this.setState({ loggedUser, pageReady: true });
        } else {
            //listen to any change to user Auth
            this.unSubscribeAuth = auth.onAuthStateChanged((userAuth: any) => {
                loggedUser = userAuth ? {
                    uid: userAuth.uid,
                    displayName: userAuth.displayName,
                    photoURL: userAuth.photoURL,
                    email: userAuth.email,
                } : null;
                if (loggedUser) {
                    localStorage.setItem('authUser', JSON.stringify(loggedUser));
                }
                this.setState({ loggedUser, pageReady: true });
            });
        }
    };

    componentWillUnmount = () => {
        if(this.state.loggedUser) {
            this.unSubscribeAuth!();
        }
    };

    renderChild = (): JSX.Element|null => {
        const { loggedUser } = this.state;
        // console.log(loggedUser, 'loggedUser');
        if (!loggedUser && Router.route !== '/') {
            //hacky fix for the routing
            Router.push('/error', '/');

           return null;
        }
        const { displayName = 'User', photoURL = null, email, uid } = loggedUser!;
        const authUser: ILoggedUser = {
            displayName,
            photoURL,
            email,
            uid
        };

        return (
            <div>{ this.props.render(authUser) }</div>
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