import React from 'react';
import {Drawer, Icon, Spin} from "Root/node_modules/antd";
import ExpenseTable from "Components/expense-table";
import {IExpenses} from "Components/interface";
import { useState, useEffect } from 'react';
import { deleteExpense } from "Root/firebase-settings";

interface IProps {
    onClose: () => void;
    selectedDate: any;
    monthPickerFormat: string;
    detailsData: IExpenses[]|null;
    showDetailsSection: boolean;
}
const MonthlyDetails = (props: IProps) => {
    const { onClose, selectedDate, monthPickerFormat, detailsData, showDetailsSection } = props;
    const title = detailsData ? detailsData[0].category : null;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [details, setDetails] = useState<IExpenses[]|null>(null);

    useEffect(() => {
        setDetails(detailsData);
    }, [detailsData]);

    const removeExpense = (id: string) => {
        setIsLoading(true);
        const exp = deleteExpense(id);
        exp.then((value: {deleted: boolean}) => {
            if(value && value.deleted) {
                const newDetailsData = details!.filter((data: any) => {
                    return data.id !== id;
                });
                setIsLoading(false);
                setDetails(newDetailsData.length > 0 ? newDetailsData : null);
            }
        });
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

    return (
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
            <Spin spinning={isLoading}>
                <ExpenseTable
                    dataSource={details as []}
                    columns={detailsColumns}
                    scroll={{ x: 400 }}
                />
            </Spin>
        </Drawer>
    );
};

export default MonthlyDetails;