import React, { Component } from 'react';
import Router from 'next/router';
import {
    Row, Col, Radio,
} from 'antd';
import 'Assets/default-theme.less';
import 'Assets/animated-cube.less';
import {
    auth, createUserWithEmailPassword, signInWithEmail,
    signInWithGoogle, createUserProfileDocument,
    getData
} from 'Root/firebase-settings';
import LoginComponent from 'Components/loginComponent';
import dynamic from 'next/dynamic';
const RegisterComponent = dynamic(
    () => import('Components/registerComponent'),
    { ssr: false }
);

interface IProps {
    form: any;
}
interface IState {
    confirmDirty: boolean;
    defaultState: string
    isLoginWithEmail: boolean;
    isLoginWithGoogle: boolean;
    registerUserInProgress: boolean;
}
class Index extends Component<IProps, IState> {
    state = {
        confirmDirty: false,
        defaultState: 'login',
        isLoginWithGoogle: false,
        isLoginWithEmail: false,
        registerUserInProgress: false
    };

    componentDidMount(): void {
        getData();
    }

    loginWithGoogle = () => {
        this.setState({ isLoginWithGoogle: true, isLoginWithEmail: false });
        signInWithGoogle()
            .then(async (response: any) => {
                //create user if not there
                await createUserProfileDocument(response.user);
                Router.push({
                    pathname: '/home'
                });
            })
            .catch((error: any) => {
                console.log(error);
                this.setState({ isLoginWithGoogle: false });
            });
    };

    loginWithEmail = (values: { email: string; password: string; displayName: string }): void => {
        this.setState({ isLoginWithGoogle: false, isLoginWithEmail: true });
        const { defaultState } = this.state;
        const { email, password, displayName ='' } = values;
        //login
        if (defaultState === 'login') {
            signInWithEmail(email, password)
                .then(() => {
                    // console.log(response);
                    Router.push({
                        pathname: '/home'
                    });
                })
                .catch(() => {
                    // console.log(error);
                    this.setState({ isLoginWithEmail: false });
                });

            return;
        }
        //sign up
        createUserWithEmailPassword(email, password)
            .then((response: any) => {
                // const loggedUser = auth.currentUser();
                auth.currentUser!.updateProfile({
                    displayName: displayName,
                    photoURL: null
                }).then(async () => {
                    //create user if not there
                    await createUserProfileDocument(response.user, {displayName: displayName});
                    Router.push({
                        pathname: '/home'
                    });
                }, function() {
                    // An error happened.
                });
            })
            .catch((error: any) => {
                console.log(error);
                this.setState({ isLoginWithEmail: false });
            });
    };

    registerNewUser = (values: {email:string; password: string; displayName: string}, formValid: boolean) => {
        this.setState({ registerUserInProgress: true });
        const {email, password, displayName = ''} = values;
        //sign up
        if (!formValid) {
            this.setState({ registerUserInProgress: false });
            return;
        }
        createUserWithEmailPassword(email, password)
            .then((response: any) => {
                // const loggedUser = auth.currentUser();
                auth.currentUser!.updateProfile({
                    displayName: displayName,
                    photoURL: null
                }).then(async () => {
                    //create user if not there
                    await createUserProfileDocument(response.user, {displayName: displayName});
                    Router.push({
                        pathname: '/home'
                    });
                }, function () {
                    // An error happened.
                });
            })
            .catch((error: any) => {
                console.log(error);
                this.setState({isLoginWithEmail: false});
            });
    };

    onChange = (e: any) => {
        this.setState({ defaultState: e.target.value });
    };

    render() {
        const { defaultState, isLoginWithEmail, isLoginWithGoogle, registerUserInProgress } = this.state;

        return (
            <Row className='home-grid'>
                <Col span={12} className='first-grid'>
                    <div>
                        <div className="animation-stage">
                            <div className="cubes-wrapper">
                                <div className="face1">
                                    <img src='/static/rupee.jpg' className='login-divider-image'/>
                                </div>
                                <div className="face2">
                                    <img src='/static/euro.jpg' className='login-divider-image' />
                                </div>
                                <div className="face3">
                                    <img src='/static/dollar.jpg' className='login-divider-image'/>
                                </div>
                                <div className="face4">
                                    <img src='/static/pound.jpg' className='login-divider-image'/>
                                </div>
                                <div className="face5">
                                    <img src='/static/yen.jpg' className='login-divider-image'/>
                                </div>
                                <div className="face6">
                                    <img src='/static/peso.jpg' className='login-divider-image'/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Radio.Group onChange={this.onChange} defaultValue={defaultState}>
                                <Radio.Button value='login'>Login</Radio.Button>
                                <Radio.Button value='register'>Register</Radio.Button>
                            </Radio.Group>
                            {
                                defaultState === 'login' ?
                                    <LoginComponent
                                        loginWithEmail={this.loginWithEmail}
                                        loginWithGoogle={this.loginWithGoogle}
                                        isLoginWithGoogle={isLoginWithGoogle}
                                        isLoginWithEmail={isLoginWithEmail}
                                    /> :
                                    <RegisterComponent
                                        registerNewUser={this.registerNewUser}
                                        registerUserInProgress={registerUserInProgress}
                                    />
                            }
                        </div>
                    </div>
                </Col>
                <Col span={12} className='second-grid grid-bg-color'>
                    <div className='main-img-wrapper'>
                        <div className='main-image'>
                            <img  src='/static/tracker.png' />
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default Index;