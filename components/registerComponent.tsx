import React, { useState } from 'react';
import {
    Button, Form, Icon,
    Input,
} from 'antd';
import {WrappedFormUtils} from "Root/node_modules/antd/lib/form/Form";
import {FormEvent} from "Root/node_modules/@types/react";

interface IProps {
    form: WrappedFormUtils;
    registerNewUser: (values: {email:string; password: string; displayName: string}, formValid: boolean) => void
    registerUserInProgress: boolean;
}

const RegisterComponent = (props: IProps) => {
    const { form, registerNewUser, registerUserInProgress } = props;
    const { getFieldDecorator } = form;
    const [confirmDirty, setConfirmDirty] = useState<boolean>(false);

    const validateToNextPassword = (_: any, value: any, callback: any) => {
        const { form } = props;
        if (value && confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };

    const compareToFirstPassword = (_: any, value: any, callback: any) => {
        const { form } = props;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    const handleConfirmBlur = (e: any) => {
        const { value } = e.target;
        const formState = confirmDirty || !!value;
        setConfirmDirty(formState);
    };

    const registerUser = (e: FormEvent) => {
        e.preventDefault();
        const { form } = props;
        form.validateFields((err: any, values: any) => {
            if(!err) {
                registerNewUser(values, true);
            } else {
                registerNewUser(values, false);
            }
        });
    };

    return (
        <Form className='form-wrapper'>
            <Form.Item>
                {getFieldDecorator('displayName', {
                    rules: [{ required: true, message: 'Please input your Display Name' }],
                })(
                    <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Display Name"
                    />,
                )}
            </Form.Item>
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
                        { required: true, message: 'Please input your Password!' },
                        { validator: validateToNextPassword }
                    ],
                })(
                    <Input.Password  placeholder="Password"/>,
                )}
            </Form.Item>
            <Form.Item>
                {getFieldDecorator('confirm', {
                    rules: [
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        {
                            validator: compareToFirstPassword,
                        },
                    ],
                })(<Input.Password onBlur={handleConfirmBlur}  placeholder="Confirm Password"/>)}
            </Form.Item>
            <Form.Item>
                <div className='login-form'>
                    <Button
                        type='primary'
                        block
                        onClick={registerUser}
                        loading={registerUserInProgress}
                    >Register</Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default  Form.create<IProps>()(RegisterComponent);