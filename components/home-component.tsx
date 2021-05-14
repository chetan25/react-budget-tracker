/* eslint-disable react/display-name */
import React, { useEffect, useReducer } from 'react';
import dynamic from 'next/dynamic';
import { auth, firestore, addExpense } from 'Root/firebase-settings';
import { ILoggedUser } from 'Components/interface';
import TabSection from 'Components/tab-section';
import AddExpenseForm from 'Components/add-expense-form';
import {
    Icon, Empty, Button, Spin,
    Drawer, DatePicker,
} from 'antd';
import { IAddExpense, IExpenses, ICategoryData } from 'Components/interface';
import { expenseCategories, tabListData } from 'Services/shared-data';
import { formatCurrency, calculateCategoryData } from 'Services/helper';
import ExpenseTable from 'Components/expense-table';
import MonthlyDetails from 'Components/./monthly-details';
import MenuItems from 'Components/./menu-items';
import { useRouter } from 'next/router';
import { useAuth } from 'Services/useAuth';
import { Commands } from 'Components/voice-command';

const VoiceCommand = dynamic(
    () => import('Components/voice-command'),
    { ssr: false },
);

import 'Assets/default-theme.less';
import moment from 'moment';
import MonthlyBudgetView from 'Components/monthly-budget-view';

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
const tabList: { key: string, tab: string }[] = tabListData;

const initialState:IState = {
    currentTab: 'expenditure',
    loading: true,
    expenses: null,
    drawerVisible: false,
    categorySum: null,
    detailsData: null,
    showDetailsSection: false,
    selectedDate: currentDate,
    detailsTableLoader: false,
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
                ...action.payload,
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

const HomeComponent = (props:IProps): JSX.Element => {
    let categoryDataArray:ICategoryData[]  = [];
    const { clearUser } = useAuth();
    const router = useRouter();

    const totalColumns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: '30%',
            sorter: (a: any, b: any) => a.category - b.category,
        },
        {
            title: 'Total Amount',
            dataIndex: 'dollarValue',
            key: 'dollarValue',
            sorter: (a: any, b: any) => a.amount - b.amount,
            width: '30%',
            render: (text: string, record: any) => {
                return <div className={parseInt(record.budget) - record.amount < 0 ? '': ''}>
                    {text}
                    {
                        parseInt(record.budget) - record.amount >= 0 ?
                            <span className='budget-icon under-budget'><Icon type="smile" theme="twoTone" twoToneColor='green' /></span> :
                            <span className='budget-icon budget-exceeded'><Icon type="frown" theme="twoTone" twoToneColor='red'/></span>
                    }
                </div>
            }
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            render: (text: string) => {
                return <span>
                    {formatCurrency(parseInt(text))}
                </span>
            },
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

    const [state, dispatch] = useReducer(homeReducer, initialState);

    useEffect(() => {
        const { selectedDate }  = state;
        const currentMonth = selectedDate.format('M');
        const currentYear = selectedDate.format('YYYY');
        const fetchData = async (currentMonth: string) => {
            const { loggedUser: { uid } } = props;
            const monthlyBudgetData: any = [];
            const budgetRef = firestore.collection('budget')
                .where('userId', "==", uid)
                .where('month', "==", currentMonth)
                .where('year', "==", currentYear);
            await budgetRef.onSnapshot((querySnapshot: any) => {
                if (querySnapshot.docs.length > 0) {
                    querySnapshot.forEach(function(doc: any) {
                        const data = doc.data();
                        monthlyBudgetData.push(data);
                    });
                }
            });

            firestore.collection("expenses")
                .where('userId', "==", uid)
                .where('expMonth', "==", parseInt(currentMonth))
                .onSnapshot((querySnapshot: any) => {
                    if (querySnapshot.docs.length > 0) {
                        const data: any = [];
                        categoryDataArray = [];
                        querySnapshot.forEach(function(doc: any) {
                            calculateCategoryData(categoryDataArray, doc.data(), monthlyBudgetData);
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
        if (state.currentTab === 'expenditure') {
            fetchData(currentMonth);
        }
    }, [state.selectedDate.format(monthPickerFormat), state.currentTab]);

    const onTabChange = (key: string) => {
        dispatch({
            type: 'set-current-tab',
            payload: {
                currentTab: key
            }
        });
    };

    const showDrawer = () => {
        dispatch({
            type: 'set-drawer-state',
            payload: {
                drawerVisible: true
            }
        });
    };

    const onClose = () => {
        dispatch({
            type: 'set-drawer-state',
            payload: {
                drawerVisible: false,
                showDetailsSection: false,
            },
        });
    };

    const handleLogOut = () => {
        auth.signOut()
            .then(() => {
                if (typeof clearUser === 'function') {
                    clearUser();
                }
                router.push('/');
            });
    };

    const decipherCommand = (transcript: Commands, synthesis: any, speech: any): void => {
        if (transcript == Commands['add new']) {
            showDrawer();
        } else if (transcript == Commands.close) {
            onClose();
        } else if (transcript == Commands['log out']) {
            handleLogOut();
        } else if(transcript == Commands.expense) {
            onTabChange('expenditure')
        } else if(transcript == Commands.budget) {
           onTabChange('budget')
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
            expYear: values.expDate.year(),
        });
        exp.then((value: {added: boolean}) => {
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

    const renderMonthlyExpenditureView = () => {
        const {
            categorySum, showDetailsSection, expenses,
            detailsData, selectedDate
        } = state;
        if (!expenses) {
            return (
                <Empty >
                    <Button type="primary" onClick={showDrawer}>Create New Expense</Button>
                </Empty>
            );
        }

        return (
            <div>
                <div className='add-button'>
                    <Button onClick={showDrawer} type="primary">Add</Button>
                </div>
                {
                    showDetailsSection ?
                        <MonthlyDetails
                            onClose={onClose}
                            selectedDate={selectedDate}
                            monthPickerFormat={monthPickerFormat}
                            detailsData={detailsData}
                            showDetailsSection={showDetailsSection}
                        />
                        : null
                }
                <ExpenseTable dataSource={categorySum as []} columns={totalColumns} scroll={{ x: 400 }}/>
            </div>
        );
    };

    const renderMonthlyBudgetView = (): JSX.Element => {
        const { loggedUser: { uid } } = props;
        const { selectedDate } = state;
        const selectedMonth = selectedDate.format('M');
        const selectedYear = selectedDate.format('YYYY');

        return (
            <MonthlyBudgetView userId={uid} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
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
        const { currentTab, loading, selectedDate, drawerVisible } = state;
        const { displayName, photoURL = '' } = loggedUser;

        return (
            <div>
                <MenuItems displayName={displayName} photoURL={photoURL} handleLogOut={handleLogOut}/>
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
                                :
                                currentTab === 'expenditure' ? renderMonthlyExpenditureView() : renderMonthlyBudgetView()
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