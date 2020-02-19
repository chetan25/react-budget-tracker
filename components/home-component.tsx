import React, { useEffect, useReducer } from 'react';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { auth, firestore, addExpense, deleteExpense } from 'Root/firebase-settings';
import { ILoggedUser } from 'Components/interface';
import TabSection from 'Components/tab-section';
import AddExpenseForm from 'Components/add-expense-form';
import {
    Menu, Icon, Empty, Button, Spin,
    Drawer, DatePicker
} from 'antd';
import { userService } from 'Services/userService';
import { IAddExpense, IExpenses, ICategoryData } from 'Components/interface';
import { expenseCategories } from 'Services/shared-data';
import { formatCurrency } from 'Services/helper';
import DetailsTable from 'Components/details-table';

const VoiceCommand = dynamic(
    () => import('Components/voice-command'),
    { ssr: false }
);
import 'Assets/default-theme.less';
import moment from 'moment';

const { MonthPicker } = DatePicker;

interface IProps {
    loggedUser: ILoggedUser;
}
interface IState {
    currentTab: string;
    loading: boolean,
    expenses: IExpenses[]|null;
    categorySum: ICategoryData[]|null;
    detailsData: IExpenses[]|null;
    showDetailsSection: boolean;
    drawerVisible: boolean;
    selectedDate: any;
    detailsTableLoader: boolean;
}
const dateFormat = 'YYYY/MM/DD';
const monthPickerFormat = 'MMMM YYYY';
const currentDate = moment();
const tabList: { key: string, tab: string }[] = [
    {
        key: 'monthly',
        tab: 'Monthly View',
    },
    {
        key: 'weekly',
        tab: 'Weekly View',
    },
];

const calculateCategoryData = (categoryDataArray:ICategoryData[], data: any): void => {
    if (categoryDataArray.length > 0) {
        const index = categoryDataArray!.findIndex((x: any): boolean => x.categoryId === data.categoryId);
        if (index >= 0) {
            categoryDataArray![index]['amount'] =
                categoryDataArray[index]['amount'] + parseInt(data.amount);
            categoryDataArray![index]['dollarValue'] = formatCurrency(categoryDataArray![index]['amount']);
        } else {
            categoryDataArray.push({
                amount: parseInt(data.amount),
                category: data.category,
                categoryId: data.categoryId,
                dollarValue: data.dollarValue,
                id: data.categoryId
            });
        }
    } else {
        categoryDataArray.push({
            amount: parseInt(data.amount),
            category: data.category,
            categoryId: data.categoryId,
            dollarValue: data.dollarValue,
            id: data.categoryId
        });
    }
};

const HomeComponent = (props:IProps): JSX.Element => {
    let categoryDataArray:ICategoryData[]  = [];
    const initialState:IState = {
        currentTab: 'monthly',
        loading: true,
        expenses: null,
        drawerVisible: false,
        categorySum: null,
        detailsData: null,
        showDetailsSection: false,
        selectedDate: currentDate,
        detailsTableLoader: false
    };

    const detailsColumns = [
        {
            title: 'Date',
            dataIndex: 'expDateFull',
            key: 'expDateFull',
            sorter: (a: any, b: any) => a.dateStamp - b.dateStamp,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: (a: any, b: any) => a.category.localeCompare(b.category),
            ellipsis: true,
        },
        {
            title: 'Amount',
            dataIndex: 'dollarValue',
            sorter: (a: any, b: any) => {
                return parseInt(a.amount) -  parseInt(b.amount);
            },
            key: 'dollarValue'
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes'
        },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (_: string, record: any) => {
                return <a onClick={() => removeExpense(record.id)}>Delete</a>
            },
        },
    ];

    const totalColumns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: (a: any, b: any) => a.category - b.category,
        },
        {
            title: 'Total Amount',
            dataIndex: 'dollarValue',
            key: 'dollarValue',
            sorter: (a: any, b: any) => a.amount - b.amount,
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            render: (text: string, record: any) => {
                return (
                    <a onClick={() => showDetails(record.categoryId)} key={text}>Details</a>
                );
            }
        }
    ];

    const removeExpense = (id: string) => {
        dispatch({
            type: 'set-details-table-loader',
            payload: {
                detailsTableLoader: true
            }
        });
        const exp = deleteExpense(id);
        exp.then((value: {deleted: boolean}|undefined) => {
            if(value && value.deleted) {
                const newDetailsData = state.detailsData!.filter((data: any) => {
                    return data.id !== id;
                });
                dispatch({
                    type: 'set-expenses',
                    payload: {
                        detailsData: newDetailsData.length > 0 ? newDetailsData : null,
                        detailsTableLoader: false
                    }
                });
            }
        });
    };

    const showDetails = (categoryId: number): void => {
        const { expenses } = state;
        const sectionData = expenses!.filter((data: IExpenses) => {
            return data.categoryId === categoryId;
        });
        dispatch({
            type: 'set-expenses',
            payload: {
                showDetailsSection: true,
                detailsData: sectionData
            }
        });
    };

    const homeReducer = (state = initialState, action: {type: string; payload: {[key: string]: any}}): IState => {
        switch(action.type) {
            case 'set-current-tab':
                return {
                    ...state,
                    ...action.payload
                };
            case 'set-loading':
                return {
                    ...state,
                    ...action.payload
                };
            case 'set-expenses':
                return {
                    ...state,
                    ...action.payload
                };
            case 'set-drawer-state':
                return {
                    ...state,
                    ...action.payload
                };
            case 'set-details-data':
                return {
                    ...state,
                    ...action.payload
                };
            case 'set-selected-date':
                return {
                    ...state,
                    ...action.payload
                };
            case 'set-details-table-loader':
                return {
                    ...state,
                    ...action.payload
                };
            default:
                return state;
        }
    };
    const [state, dispatch] = useReducer(homeReducer, initialState);

    useEffect(() => {
        const { selectedDate }  = state;
        const currentMonth = selectedDate.format('M');
        const fetchData = (currentMonth: string) => {
            const { loggedUser: { uid } } = props;
            firestore.collection("expenses")
                .where('userId', "==", uid)
                .where('expMonth', "==", parseInt(currentMonth))
                .onSnapshot((querySnapshot: any) => {
                    if (querySnapshot.docs.length > 0) {
                        const data: any = [];
                        categoryDataArray = [];
                        querySnapshot.forEach(function(doc: any) {
                            calculateCategoryData(categoryDataArray, doc.data());
                            data.push({ ...doc.data(), id: doc.id});
                        });
                        dispatch({
                            type: 'set-expenses',
                            payload: {
                                expenses: data,
                                categorySum: categoryDataArray
                            }
                        });
                        dispatch({
                            type: 'set-loading',
                            payload: {
                                loading: false
                            }
                        });
                    } else {
                        dispatch({
                            type: 'set-expenses',
                            payload: {
                                expenses: null
                            }
                        });
                        dispatch({
                            type: 'set-loading',
                            payload: {
                                loading: false
                            }
                        });
                    }
                });
        };
        fetchData(currentMonth);
    }, [state.selectedDate.format(monthPickerFormat)]);

    // const handleClick = (e: any) => {
    //     console.log('click ', e);
    // };

    const onTabChange = (key: string) => {
        dispatch({
            type: 'set-expenses',
            payload: {
                currentTab: key
            }
        });
    };

    const showDrawer = () => {
        dispatch({
            type: 'set-expenses',
            payload: {
                drawerVisible: true
            }
        });
    };

    const onClose = () => {
        dispatch({
            type: 'set-expenses',
            payload: {
                drawerVisible: false,
                showDetailsSection: false
            }
        });
    };

    const handleLogOut = () => {
        auth.signOut()
            .then(() => {
                userService.clearUser();
                Router.push('/error', '/');
            });
    };

    const handleMenuChange = ({ key }: { key: string}) => {
        if (key === 'logOut') {
            handleLogOut();
        }
    };

    const decipherCommand = (transcript: string, synthesis: any, speech: any): void => {
        const { drawerVisible } = state;
        if (transcript == 'open') {
            showDrawer();
        } else if (transcript == 'close') {
            if (drawerVisible) {
                onClose();
            }
        } else if (transcript == 'log out') {
            handleLogOut();
        } else if(transcript == 'monthly') {
            onTabChange('monthly')
        } else if(transcript == 'weekly') {
            onTabChange('weekly')
        } else if(transcript == 'submit') {
            // addNewExpense();
        } else {
            speech.text = '';
            synthesis.speak(speech);
        }
    };

    const addNewExpense = (values: IAddExpense) => {
        const { loggedUser: { uid } } = props;
        const exp = addExpense({
            category: expenseCategories[values.select].label,
            categoryId: expenseCategories[values.select].id,
            amount: values.amount,
            dollarValue: formatCurrency(parseInt(values.amount)),
            userId: uid,
            notes: values.notes ? values.notes : '',
            dateStamp: values.expDate.unix(),
            expDateFull: values.expDate.format('YYYY-MM-DD'),
            expMonth: values.expDate.month() + 1,
            expDate: values.expDate.date(),
            expYear: values.expDate.year()
        });
        exp.then((value: {added: boolean}|undefined) => {
            if(value && value.added) {
                onClose();
            }
        });
    };

    const renderDrawer = () => {
        const { selectedDate } = state;

        return (
            <Drawer
                title="Create a new Expense"
                width={720}
                onClose={onClose}
                placement="right"
                closable={false}
                visible={state.drawerVisible}
                getContainer={false}
                style={{ position: 'absolute' }}
            >
                <AddExpenseForm
                    dateFormat={dateFormat}
                    currentDate={selectedDate}
                    onClose={onClose}
                    addNewExpense={addNewExpense}
                    buttonWrapperClass='drawer-form-button'
                />
            </Drawer>
        );
    };

    const renderMonthlyView = () => {
        const {
            categorySum, showDetailsSection,
            detailsData, selectedDate, detailsTableLoader
        } = state;
        const title = detailsData ? detailsData[0].category : null;

        return (
            <div>
                <div className='add-button'>
                    <Button onClick={showDrawer} type="primary">Add</Button>
                </div>
                {
                    showDetailsSection ?
                        <Drawer
                            title={
                               <div className='expense-details-title'>
                                   <div>{title} expenses for {selectedDate.format(monthPickerFormat)}</div>
                                   <div onClick={onClose} className='close-icon'><Icon type="close-circle" theme="twoTone" /></div>
                               </div>
                            }
                            width={720}
                            onClose={onClose}
                            placement="right"
                            closable={false}
                            visible={showDetailsSection}
                            getContainer={false}
                            style={{ position: 'absolute' }}
                        >
                            <Spin spinning={detailsTableLoader}>
                                <DetailsTable
                                    dataSource={detailsData as []}
                                    columns={detailsColumns}
                                    scroll={{ x: 400 }}
                                />
                            </Spin>
                        </Drawer>
                        : null
                }
                <DetailsTable dataSource={categorySum as []} columns={totalColumns}/>
            </div>
        );
    };

    const renderExpenseView = () => {
        const { currentTab } = state;

        return (
            <>
                {
                    currentTab === 'monthly' ? renderMonthlyView() :
                        <div className='empty-wrapper'>
                            <div>
                                <Empty
                                    description={
                                        <span>
                                       The Feature in Under Progress
                                   </span>
                                    }
                                />
                            </div>
                        </div>
                }
            </>
        );
    };

    const onMonthChange = (date: any) => {
        dispatch({
            type: 'set-selected-date',
            payload: {
                selectedDate: date,
            }
        });
    };

    const renderHome = () => {
        const { loggedUser } = props;
        const { currentTab, expenses, loading, selectedDate, drawerVisible } = state;
        const { displayName, photoURL = '' } = loggedUser;

        return (
            <div>
                <Menu
                    defaultSelectedKeys={['mail']}
                    mode="horizontal"
                    onClick={handleMenuChange}
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
                    <TabSection
                        title={
                            <MonthPicker
                                onChange={onMonthChange}
                                placeholder="Select month"
                                defaultValue={selectedDate}
                                format={monthPickerFormat}
                                allowClear={false}
                            />
                        }
                        tabList={tabList}
                        currentTab={currentTab}
                        onTabChange={key => onTabChange(key) }
                        extra={
                            <VoiceCommand
                                onResult={decipherCommand}
                                userName={displayName!}
                            />
                        }
                    >
                        {
                            loading ?
                                <div className='center'><Spin/></div>
                                : expenses ?
                                <div>
                                    { renderExpenseView() }
                                </div>
                                : <Empty >
                                    <Button type="primary" onClick={showDrawer}>Create New Expense</Button>
                                </Empty>
                        }
                        { drawerVisible ? renderDrawer() : null }
                    </TabSection>
                </div>
            </div>
        );
    };

    return (
        <>
            { renderHome() }
        </>
    );
};

export default HomeComponent;