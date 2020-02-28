import { formatCurrency, calculateCategoryData } from 'Services/helper';
import {ICategoryBudget} from "Components/interface";

describe('Test the formatter function', () => {
    it('should return formatted currency', function () {
        expect(formatCurrency(40)).toBe('$40.00');
    });
});

describe('test calculateCategoryData function', () => {
    it('should aggregate data properly when initial data is empty', function () {
        const categoryDataArray: any = [];
        const data = {
            categoryId: '3',
            amount: '3',
            category: 'Test',
            dollarValue: '$3.00',
        };
        const monthlyBudgetData: ICategoryBudget[] = [{
            amount: '22',
            categoryLabel: 'Test',
            categoryId: '3',
            dollarValue: '$22.00',
            id: '3'
        }];
        calculateCategoryData(categoryDataArray, data, monthlyBudgetData);
        expect(categoryDataArray).toStrictEqual([
            {
                amount: 3,
                category: 'Test',
                categoryId: '3',
                dollarValue: '$3.00',
                id: '3',
                budget: '22'
            }
        ])
    });

    it('should aggregate data properly when initial data is there', function () {
        const categoryDataArray: any = [{
            amount: 3,
            category: 'Test',
            categoryId: '3',
            dollarValue: '$3.00',
            id: '3',
            budget: '22'
        }];
        const data = {
            categoryId: '3',
            amount: '10',
            category: 'Test',
            dollarValue: '$10.00',
        };
        const monthlyBudgetData: ICategoryBudget[] = [{
            amount: '22',
            categoryLabel: 'Test',
            categoryId: '3',
            dollarValue: '$22.00',
            id: '3'
        }];
        calculateCategoryData(categoryDataArray, data, monthlyBudgetData);
        expect(categoryDataArray).toStrictEqual([
            {
                amount: 13,
                category: 'Test',
                categoryId: '3',
                dollarValue: '$13.00',
                id: '3',
                budget: '22'
            }
        ])
    });

    it('should aggregate data properly when there is no budget data', function () {
        const categoryDataArray: any = [];
        const data = {
            categoryId: '3',
            amount: '10',
            category: 'Test',
            dollarValue: '$10.00',
        };
        const monthlyBudgetData: ICategoryBudget[] = [];
        calculateCategoryData(categoryDataArray, data, monthlyBudgetData);
        expect(categoryDataArray).toStrictEqual([
            {
                amount: 10,
                category: 'Test',
                categoryId: '3',
                dollarValue: '$10.00',
                id: '3',
                budget: '0.00'
            }
        ])
    });
});