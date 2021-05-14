import React from 'react';
import {
    Button, Form, Icon,
    Input, Divider,
} from 'antd';
import {WrappedFormUtils} from "Root/node_modules/antd/lib/form/Form";
import {FormEvent} from "Root/node_modules/@types/react";

interface IProps {
    form: WrappedFormUtils;
    loginWithEmail: (values: { email: string; password: string; displayName: string }) => void;
    loginWithGoogle: () => void
    isLoginWithGoogle: boolean;
    isLoginWithEmail: boolean;
}

const LoginComponent = (props: IProps) => {
    const {
        form, loginWithEmail, loginWithGoogle,
        isLoginWithEmail = false, isLoginWithGoogle = false,
    } = props;
    const { getFieldDecorator } = form;

    const  loginUsingEmail = (e: FormEvent) => {
        e.preventDefault();
        form.validateFields((err: any, values: any) => {
            if(!err) {
                loginWithEmail(values);
            }
        });
    };

    return (
        <Form className='form-wrapper'>
            <Form.Item>
                {getFieldDecorator('email', {
                    rules: [
                        {
                            type: 'email',
                            message: 'The input is not valid E-mail!',
                        },
                        { required: true, message: 'Please input your Email' }
                    ],
                })(
                    <Input
                        prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Email"
                    />,
                )}
            </Form.Item>
            <Form.Item>
                {getFieldDecorator('password', {
                    rules: [
                        { required: true, message: 'Please input your Password!' }
                    ],
                })(
                    <Input.Password  placeholder="Password"/>,
                )}
            </Form.Item>
            <Form.Item>
                <div className='login-form'>
                    <Button
                        type='primary'
                        block
                        onClick={loginUsingEmail}
                        loading={isLoginWithEmail}
                        disabled={isLoginWithGoogle}
                    >Submit</Button>
                    <Divider>Or</Divider>
                    <Button
                        type='primary'
                        block
                        icon='google'
                        onClick={loginWithGoogle}
                        loading={isLoginWithGoogle}
                        disabled={isLoginWithEmail}
                    >Login with Google</Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default Form.create<IProps>()(LoginComponent);