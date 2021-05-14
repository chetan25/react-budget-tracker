import React from 'react';
import {
    Button, Form, Input, Spin,
} from 'antd';
import { WrappedFormUtils } from "Root/node_modules/antd/lib/form/Form";
import { useEffect, useState } from 'react';
import { firestore } from "Root/firebase-settings";
import { expenseCategories } from 'Services/shared-data';
import {FormEvent} from "Root/node_modules/@types/react";
import { formatCurrency } from 'Services/helper';
import { ICategoryBudget } from 'Components/./interface';

interface IProps {
    form: WrappedFormUtils;
    selectedMonth: string;
    selectedYear: string;
    userId: string;
}

const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 8 },
};
const formTailLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15, offset: 6 },
};

const MonthlyBudgetView = (props: IProps) => {
    const [categoryBudget, setCategoryBudget] = useState<ICategoryBudget[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [firstTimeAdd, setFirstTimeAdd] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { form } = props;
    const { getFieldDecorator } = form;
    const { selectedMonth, selectedYear, userId } = props;

    useEffect(() => {
        const fetchData = () => {
            firestore.collection("budget")
                .where('userId', "==", userId)
                .where('month', "==", selectedMonth)
                .where('year', "==", selectedYear)
                .onSnapshot((querySnapshot: any) => {
                    if (querySnapshot.docs.length > 0) {
                        const categoryBudgetDefault: any[] = [];
                        querySnapshot.forEach(function(doc: any) {
                            const data = doc.data();
                            categoryBudgetDefault.push({
                                amount: parseInt(data['amount']),
                                categoryId: data['categoryId'],
                                categoryLabel: data['categoryLabel'],
                                dollarValue: data['dollarValue'],
                                id: doc.id,
                            });
                        });
                        setCategoryBudget(categoryBudgetDefault);
                    } else {
                        const cateGoryBudgetDefault =
                            Object.values(expenseCategories).map(data => {
                               return {
                                    amount: '0.00',
                                    categoryId: data.id.toString(),
                                    categoryLabel: data.label,
                                    dollarValue: '$0.00',
                                    id: null,
                               }
                            });
                        setCategoryBudget(cateGoryBudgetDefault);
                        setFirstTimeAdd(true);
                    }
                    setLoading(false);
                });
       };
        fetchData();
    }, [selectedMonth, selectedYear]);

    const saveBudget = (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        form.validateFields((err: any, values: any) => {
            if(!err) {
                if(firstTimeAdd) {
                    const documents: any[] = [];
                    for(const key in values) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (values.hasOwnProperty(key)) {
                            const keyLabel = key.split('-');
                            const data = {
                                amount: values[key] ? values[key] : 0.00,
                                categoryId: keyLabel[0],
                                categoryLabel: keyLabel[1],
                                userId: userId,
                                dollarValue: values[key] ? formatCurrency(values[key]) : '$0.00',
                                month: selectedMonth,
                                year: selectedYear
                            };
                            documents.push(data);
                        }
                    }
                    setTimeout(() => {
                        const batch = firestore.batch();
                        documents.forEach((doc) => {
                            const docRef = firestore.collection('budget').doc(); //automatically generate unique id
                            batch.set(docRef, doc);
                        });
                        batch.commit();
                        setIsSaving(false);
                        setFirstTimeAdd(false);
                    }, 100);
                } else {
                    setTimeout(() => {
                        const batch = firestore.batch();
                        categoryBudget.forEach((doc) => {
                            const docRef = firestore.collection('budget').doc(doc.id as string); //automatically generate unique id
                            const id = `${doc.categoryId}-${doc.categoryLabel}`;
                            batch.update(docRef, {
                                amount: values[id],
                                dollarValue: formatCurrency(values[id]),
                            });
                        });
                        batch.commit();
                        setIsSaving(false);
                    }, 100);
                }
            }
        });
    };

    return (
        <div className='budget-wrapper'>
            <Spin spinning={loading}>
                {
                    categoryBudget.map((data: ICategoryBudget) => {
                        return (
                            <div key={`${data.categoryLabel}-${data.id}`}>
                                <Form.Item {...formItemLayout} label={data.categoryLabel} >
                                    {
                                        getFieldDecorator(`${data.categoryId}-${data.categoryLabel}`, {initialValue: data.amount})
                                        (<Input placeholder={`Please input ${data.categoryLabel} budget`} />)
                                    }
                                </Form.Item>
                            </div>
                        )
                    })
                }
                <Form.Item {...formTailLayout}>
                    <div className='budget-form-button'>
                        <Button
                            type='primary'
                            onClick={saveBudget}
                            loading={isSaving}
                        >Save</Button>
                    </div>
                </Form.Item>
            </Spin>
        </div>
    );
};

export default Form.create<IProps>()(MonthlyBudgetView);
