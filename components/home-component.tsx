import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { auth, firestore, addExpense } from 'Root/firebase-settings';
import { ILoggedUser } from 'Components/interface';
import { FormComponentProps } from 'antd/lib/form'
import {
    Menu, Icon, Card, Empty, Button, Spin,
    Drawer, Form, Col, Row, Input, DatePicker, Table
} from 'antd';

const VoiceCommand = dynamic(
    () => import('Components/voice-command'),
    { ssr: false }
);
import 'Assets/default-theme.less';
import moment from 'moment';
import {WrappedFormUtils} from "Root/node_modules/antd/lib/form/Form";

interface IExpenses {
    description: string;
    id: string;
    month: string;
    date: string;
    year: string;
    amount: string;
}

interface IProps extends FormComponentProps {
    loggedUser: ILoggedUser;
    form: WrappedFormUtils;
}
interface IState {
    tabList: { key: string, tab: string }[];
    currentTab: string;
    loading: boolean,
    expenses: IExpenses[]|null;
    recording: boolean;
    drawerVisible: boolean;
    addingExpenseInProgress: boolean;
}
const dateFormat = 'YYYY/MM/DD';
const currentDate = moment().format('YYYY MMMM');
const columns = [
    {
        title: 'Date',
        dataIndex: 'expDateFull',
        key: 'expDateFull',
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
    },
    {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (text: string) => `$${text}`,
    }
];

class HomeComponent extends Component<IProps, IState> {
    state:IState = {
        tabList: [
            {
                key: 'monthly',
                tab: 'Monthly View',
            },
            {
                key: 'weekly',
                tab: 'Weekly View',
            },
        ],
        currentTab: 'monthly',
        loading: true,
        expenses: null,
        drawerVisible: false,
        recording: false,
        addingExpenseInProgress: false
    };

    componentDidMount(): void {
        const fetchData = () => {
            const { loggedUser: { uid } } = this.props;
            firestore.collection("expenses").where('userId', "==", uid)
                .onSnapshot((querySnapshot: any) => {
                    if (querySnapshot.docs.length > 0) {
                        const data: any = [];
                        querySnapshot.forEach(function(doc: any) {
                            data.push({ ...doc.data(), id: doc.id});
                        });
                        // @ts-ignore
                        this.setState({
                            loading: false,
                            expenses: data
                        });
                    } else {
                        this.setState({
                            loading: false,
                            expenses: null
                        });
                    }
                });
        };
        fetchData();
    }

    handleClick = (e: any) => {
        console.log('click ', e);
    };

    onTabChange = (key: string) => {
        this.setState({ currentTab: key });
    };

    showDrawer = () => {
        this.setState({
            drawerVisible: true,
        });
    };

    onClose = () => {
        this.setState({
            drawerVisible: false,
        });
    };

    handleLogOut = () => {
        auth.signOut()
            .then(() => {
                localStorage.removeItem('authUser');
                Router.push('/error', '/');
            });
    };

    handleMenuChange = ({ key }: { key: string}) => {
        if (key === 'logOut') {
            this.handleLogOut();
        }
    };

    startRecording = () => {
        this.setState({ recording: true });
    };

    stopRecording = () => {
        this.setState({ recording: false });
    };

    decipherCommand = (transcript: string, synthesis: any, speech: any): void => {
        const { drawerVisible } = this.state;
        if (transcript == 'open') {
            this.showDrawer();
        } else if (transcript == 'close') {
            if (drawerVisible) {
                this.onClose();
            }
        } else if (transcript == 'log out') {
            this.handleLogOut();
        } else if(transcript == 'monthly') {
            this.onTabChange('monthly')
        } else if(transcript == 'weekly') {
            this.onTabChange('weekly')
        } else if(transcript == 'submit') {
            this.addNewExpense();
        } else {
            speech.text = '';
            synthesis.speak(speech);
        }
    };

    addNewExpense = () => {
        // e.preventDefault();
        this.setState({addingExpenseInProgress: true});
        const { form } = this.props;
        const { resetFields } = form;
        form.validateFields((err: any, values: any) => {
            if(!err) {
                const { loggedUser: { uid } } = this.props;
                const exp = addExpense({
                    ...values,
                    userId: uid,
                    expDateFull: values.expDate.format('YYYY-MM-DD'),
                    expMonth: values.expDate.month() + 1,
                    expDate: values.expDate.date(),
                    expYear: values.expDate.year()
                });
                exp.then((value: {added: boolean}|undefined) => {
                    if(value && value.added) {
                        this.setState({addingExpenseInProgress: false});
                        this.onClose();
                    }
                });
            } else {
                this.setState({addingExpenseInProgress: false});
            }
        });
        resetFields();
    };

    renderDrawer = () => {
        const { getFieldDecorator } = this.props.form;
        const {addingExpenseInProgress} = this.state;

        return (
            <Drawer
                title="Create a new Expense"
                width={720}
                onClose={this.onClose}
                placement="right"
                closable={false}
                visible={this.state.drawerVisible}
                getContainer={false}
                style={{ position: 'absolute' }}
            >
                <Form layout="vertical" hideRequiredMark>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Type">
                                {getFieldDecorator('type', {
                                    rules: [{ required: true, message: 'Please enter expense type' }],
                                })(<Input placeholder="Please enter expense type" />)}
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
                                    initialValue: moment(new Date(), dateFormat)
                                })(
                                    // @ts-ignore
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format={dateFormat}
                                        getPopupContainer={(trigger: any) => trigger.parentNode}

                                    />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                        </Col>
                    </Row>
                </Form>
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        borderTop: '1px solid #e9e9e9',
                        padding: '10px 16px',
                        background: '#fff',
                        textAlign: 'right',
                    }}
                >
                    <Button
                        onClick={this.onClose}
                        style={{ marginRight: 8 }}
                        disabled={addingExpenseInProgress}
                    >Cancel</Button>
                    <Button
                        onClick={this.addNewExpense}
                        type="primary"
                        loading={addingExpenseInProgress}
                    >Submit</Button>
                </div>
            </Drawer>
        );
    };

    renderMonthlyView = () => {
        const { expenses } = this.state;
        //@ts-ignore
        return (
            <div>
                <div className='add-button'>
                    <Button onClick={this.showDrawer} type="primary">Add</Button>
                </div>
                <Table columns={columns} dataSource={expenses as IExpenses[]} rowKey='id'/>
            </div>
        );
    };

    renderExpenseView = () => {
        const { currentTab } = this.state;

        return (
            <>
                {
                    currentTab === 'monthly' ? this.renderMonthlyView() :
                        <Empty
                            description={
                               <div>
                                   The Feature in Under Progress
                               </div>
                            }
                        ></Empty>
                }
            </>
        );
    };

    renderHome = () => {
        const { loggedUser } = this.props;
        const { tabList, currentTab, expenses, recording, loading } = this.state;
        const { displayName, photoURL = '' } = loggedUser;
        const monthYear = currentDate;

        return (
            <div>
                <Menu
                    defaultSelectedKeys={['mail']}
                    mode="horizontal"
                    onClick={this.handleMenuChange}
                >
                    <Menu.Item key="mail" className='logo-text'>
                        {
                            photoURL ?
                                <img src={photoURL!} className='logo-image' /> :
                                <Icon type="user" />
                        }
                        <span className='logo-text'>{displayName}</span>
                    </Menu.Item>
                    <Menu.Item key="logOut" className='log-out float-right'>
                        <Icon type="mail" />
                        Log Out
                    </Menu.Item>
                </Menu>
                <div className='card-wrapper'>
                    <Card
                        className='card-content'
                        title={monthYear}
                        extra={
                            <VoiceCommand
                                onStart={this.startRecording}
                                onStop={this.stopRecording}
                                recording={recording}
                                onResult={this.decipherCommand}
                                userName={displayName!}
                            />
                        }
                        tabList={tabList}
                        activeTabKey={currentTab}
                        onTabChange={key => this.onTabChange(key) }
                    >
                        {
                            loading ?
                                <div className='center'><Spin/></div>
                                : expenses ?
                                <div>
                                    { this.renderExpenseView() }
                                </div>
                                : <Empty >
                                    <Button type="primary" onClick={this.showDrawer}>Create New Expense</Button>
                                </Empty>
                        }
                        { this.renderDrawer() }
                    </Card>
                </div>
            </div>
        );
    };

    render() {
        return (
            <>
                { this.renderHome() }
            </>
        );
    }
}

export default Form.create<IProps>()(HomeComponent);