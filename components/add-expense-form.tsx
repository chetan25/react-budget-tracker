import React, { Component } from 'react';
import { Row, Col, Form, Input, DatePicker , Button, Select } from 'antd';
import {WrappedFormUtils} from "Root/node_modules/antd/lib/form/Form";
import moment from "moment";
import {FormComponentProps} from "Root/node_modules/antd/lib/form";
import { IAddExpense } from 'Components/interface';
import { expenseCategories } from 'Services/shared-data';

const { Option } = Select;
interface IProps extends FormComponentProps {
    form: WrappedFormUtils;
    dateFormat: string;
    onClose: () => void;
    addNewExpense: (values: IAddExpense) => void;
    buttonWrapperClass: string;
    currentDate: any;
}

interface IState {
    addingExpenseInProgress: boolean;
}
class AddExpenseForm extends Component<IProps, IState> {
    state = {
        addingExpenseInProgress: false
    };

    componentDidMount() {
        const { resetFields } = this.props.form;
        resetFields();
    }

    addExpense = () => {
        this.setState({addingExpenseInProgress: true});
        setTimeout(() => {
            const { addNewExpense, form } = this.props;
            const { resetFields } = form;
            form.validateFields((err: any, values: any) => {
                if (!err) {
                    addNewExpense(values);
                    resetFields();
                    this.setState({addingExpenseInProgress: false});
                } else {
                    this.setState({addingExpenseInProgress: false});
                }
            });
        }, 100);
    };

    render = () => {
        const { getFieldDecorator } = this.props.form;
        const { dateFormat, onClose, buttonWrapperClass, currentDate } = this.props;
        const { addingExpenseInProgress } = this.state;

        return (
            <>
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Type" hasFeedback>
                                {getFieldDecorator('select', {
                                    rules: [{ required: true, message: 'Please select expense type!' }],
                                })(
                                    <Select placeholder="Please select a country">
                                        {
                                            Object.entries(expenseCategories)
                                                .map(([key, value]): JSX.Element => (
                                                    <Option value={key} key={value.id}>{value.label}</Option>
                                                ))
                                        }
                                    </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Amount">
                                {getFieldDecorator('amount', {
                                    rules: [{ required: true, message: 'Please enter expense amount' }],
                                })(
                                    <Input prefix='$'  placeholder="0.00" style={{ width: '100%' }} />,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Date">
                                {getFieldDecorator('expDate', {
                                    rules: [{ required: true, message: 'Please add expense date' }],
                                    initialValue: moment(currentDate, dateFormat)
                                })(
                                    // @ts-ignore
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format={dateFormat}
                                    />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Notes">
                                {getFieldDecorator('notes')(
                                    <Input placeholder="Expense Note" style={{ width: '100%' }} />,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <div className={buttonWrapperClass}>
                    <Button
                        onClick={onClose}
                        style={{ marginRight: 8 }}
                        disabled={addingExpenseInProgress}
                    >Cancel</Button>
                    <Button
                        onClick={this.addExpense}
                        type="primary"
                        loading={addingExpenseInProgress}
                    >Submit</Button>
                </div>
            </>
        );
    }
}

export default  Form.create<IProps>()(AddExpenseForm);