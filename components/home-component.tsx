import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { auth, firestore } from 'Root/firebase-settings';
import { ILoggedUser } from 'Components/interface';
import { FormComponentProps } from 'antd/lib/form'
import {
    Menu, Icon, Card, Empty, Button, Modal,
    Drawer, Form, Col, Row, Input, DatePicker
} from 'antd';

const VoiceCommand = dynamic(
    () => import('Components/voice-command'),
    { ssr: false }
);
import 'Assets/default-theme.less';
import moment from 'moment';

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
}
interface IState {
    tabList: { key: string, tab: string }[];
    currentTab: string;
    loading: boolean,
    expenses: IExpenses[]|null;
    recording: boolean;
    drawerVisible: boolean;
    showCommandModal: boolean;
}
const dateFormat = 'YYYY/MM/DD';
const currentDate = moment().format('YYYY MMMM');

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
        loading: false,
        expenses: null,
        drawerVisible: false,
        recording: false,
        showCommandModal: false
    };

    componentDidMount(): void {
        const fetchData = async () => {
            const snapshot = await firestore.collection('expenses').get();
            if (snapshot.docs.length > 0) {
                snapshot.docs.map((doc: any) => {
                    const data = doc.data();
                    // @ts-ignore
                    this.setState({
                        loading: false,
                        expenses: data
                    });
                });
            } else {
                // @ts-ignore
                this.setState({
                    loading: false,
                    expenses: null
                });
            }
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
        const { showCommandModal, drawerVisible } = this.state;
        if (transcript == 'open') {
            this.showDrawer();
        } else if (transcript == 'close') {
            if (drawerVisible) {
                this.onClose();
            }  else if(showCommandModal) {
                this.setState({ showCommandModal: false });
            }
        } else if (transcript == 'options') {
            this.setState({ showCommandModal: true });
        } else if (transcript == 'log out') {
            this.handleLogOut();
        } else if(transcript == 'monthly') {
            this.onTabChange('monthly')
        } else if(transcript == 'weekly') {
            this.onTabChange('weekly')
        } else {
            speech.text = '';
            synthesis.speak(speech);
        }
    };

    cancelCommandModal = () => {
        this.setState({showCommandModal: false});
    };

    renderDrawer = () => {
        const { getFieldDecorator } = this.props.form;

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
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: 'Please enter expense type' }],
                                })(<Input placeholder="Please enter user name" />)}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Amount">
                                {getFieldDecorator('url', {
                                    rules: [{ required: true, message: 'Please enter url' }],
                                })(
                                    <Input prefix='$'  placeholder="0.00" style={{ width: '100%' }} />,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Date">
                                {getFieldDecorator('dateTime', {
                                    rules: [{ required: true, message: 'Please choose the dateTime' }],
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
                    <Button onClick={this.onClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button onClick={this.onClose} type="primary">
                        Submit
                    </Button>
                </div>
            </Drawer>
        );
    };

    renderCommandModal = () => {
        Modal.info({
            title: 'Voice Commands',
            content: (
                <div>
                    <p>Options - To see available Voice options.</p>
                    <p>Open - To Open the Add New Expense Modal</p>
                    <p>Close - To close any open Modal</p>
                    <p>Log Out - To Log Out of App</p>
                    <p>Stop - Stop voice activation</p>
                </div>
            ),
            onCancel: () => this.cancelCommandModal,
        });
    };

    renderHome = () => {
        const { loggedUser } = this.props;
        const { tabList, currentTab, expenses, recording } = this.state;
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
                       <img src={photoURL!} className='logo-image' />
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
                            expenses ?
                               null
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
        const { showCommandModal } = this.state;
        return (
            <>
                { this.renderHome() }
                {
                    showCommandModal ? this.renderCommandModal() : null
                }
            </>
        );
    }
}

export default Form.create<IProps>()(HomeComponent);