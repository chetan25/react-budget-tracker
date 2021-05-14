import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
    Row, Col, Radio, Alert,
} from 'antd';
import 'Assets/default-theme.less';
import 'Assets/animated-cube.less';
import {
    auth, createUserWithEmailPassword, signInWithEmail,
    signInWithGoogle, createUserProfileDocument, UserType,
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
    errorMessage: string | null;
}
const Index = (props: IProps) => {
    const router = useRouter();
    const [state, setState] = useState<IState>({
        confirmDirty: false,
        defaultState: 'login',
        isLoginWithGoogle: false,
        isLoginWithEmail: false,
        registerUserInProgress: false,
        errorMessage: null,
    })

    const loginWithGoogle = () => {
        setState((prevState) => ({
            ...prevState,
            isLoginWithGoogle: true, isLoginWithEmail: false, errorMessage: null
        }));
        signInWithGoogle()
            .then(async (response: UserType) => {
                //create user if not there
                await createUserProfileDocument(response.user);
                router.push('/home');
            })
            .catch((error: Record<string, string>) => {
                setState((prevState) => ({
                    ...prevState,
                    isLoginWithGoogle: false,
                    errorMessage: error.message 
                }));
            });
    };

    const loginWithEmail = (values: { email: string; password: string; displayName: string }): void => {
        setState((prevState) => ({
            ...prevState,
            isLoginWithGoogle: false, isLoginWithEmail: true, errorMessage: null
        }));
        const { defaultState } = state;
        const { email, password, displayName ='' } = values;
        //login
        if (defaultState === 'login') {
            signInWithEmail(email, password)
                .then(() => {
                    // console.log(response);
                    router.push('/home');
                })
                .catch((error: {code: number; message: string}) => {
                    setState((prevState) => ({
                        ...prevState,
                        isLoginWithEmail: false,  errorMessage: error.message
                    }));
                });
            return;
        }
        //sign up
        createUserWithEmailPassword(email, password)
            .then((response: UserType) => {
                // const loggedUser = auth.currentUser();
                auth.currentUser!.updateProfile({
                    displayName: displayName,
                    photoURL: null,
                }).then(async () => {
                    //create user if not there
                    await createUserProfileDocument(response.user, {displayName: displayName});
                    Router.push({
                        pathname: '/home',
                    });
                }, function() {
                    // An error happened.
                });
            })
            .catch((error: Record<string, string>) => {
                this.setState({ isLoginWithEmail: false, errorMessage: error.message });
            });
    };

    const registerNewUser = (values: {email:string; password: string; displayName: string}, formValid: boolean) => {
        setState((prevState) => ({
            ...prevState,
            registerUserInProgress: true, errorMessage: null
        }));
        const {email, password, displayName = ''} = values;
        //sign up
        if (!formValid) {
            setState((prevState) => ({
                ...prevState,
                registerUserInProgress: false
            }));
            return;
        }
        createUserWithEmailPassword(email, password)
            .then((response: UserType) => {
                // const loggedUser = auth.currentUser();
                auth.currentUser!.updateProfile({
                    displayName: displayName,
                    photoURL: null,
                }).then(async () => {
                    //create user if not there
                    await createUserProfileDocument(response.user, {displayName: displayName});
                    router.push('/home');
                }, function () {
                    // An error happened.
                });
            })
            .catch((error: Record<string, string>) => {
                setState((prevState) => ({
                    ...prevState,
                    registerUserInProgress: false, errorMessage: error.message
                }));
            });
    };

    const onChange = (e: any) => {
        setState((prevState) => ({
            ...prevState,
            defaultState: e.target.value, errorMessage: null
        }));
    };

    const renderAlert = (message: string): JSX.Element => {
      return (
          <Alert
              message={message}
              type="error"
              closable
          />
      );
    };

    
    const { defaultState, isLoginWithEmail, isLoginWithGoogle, registerUserInProgress, errorMessage } = state;

    return (
        <Row className='home-grid'>
            <Col span={24} className='first-grid'>
                <>
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
                        <Radio.Group onChange={onChange} defaultValue={defaultState} className='radio-login'>
                            <Radio.Button value='login'>Login</Radio.Button>
                            <Radio.Button value='register'>Register</Radio.Button>
                        </Radio.Group>
                        {
                            defaultState === 'login' ?
                                <LoginComponent
                                    loginWithEmail={loginWithEmail}
                                    loginWithGoogle={loginWithGoogle}
                                    isLoginWithGoogle={isLoginWithGoogle}
                                    isLoginWithEmail={isLoginWithEmail}
                                /> :
                                <RegisterComponent
                                    registerNewUser={registerNewUser}
                                    registerUserInProgress={registerUserInProgress}
                                />
                        }
                        {
                            errorMessage ? renderAlert(`Error -${errorMessage}`) : null
                        }
                    </div>
                </>
            </Col>
        </Row>
    );
}

export default Index;