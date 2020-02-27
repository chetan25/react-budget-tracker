import {ICategoryBudget, ICategoryData} from "Components/interface";

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const formatCurrency = (currency: number) => {
    return formatter.format(currency);
};

export const calculateCategoryData = (categoryDataArray:ICategoryData[], data: any, monthlyBudgetData: ICategoryBudget[]): void => {
    if (categoryDataArray.length > 0) {
        const index = categoryDataArray!.findIndex((x: any): boolean => x.categoryId === data.categoryId);
        if (index >= 0) {
            categoryDataArray![index]['amount'] =
                categoryDataArray[index]['amount'] + parseInt(data.amount);
            categoryDataArray![index]['dollarValue'] = formatCurrency(categoryDataArray![index]['amount']);

            return;
        }
    }
    const budgetData = monthlyBudgetData.find((x: any): boolean => x.categoryId == data.categoryId);
    categoryDataArray.push({
        amount: parseInt(data.amount),
        category: data.category,
        categoryId: data.categoryId,
        dollarValue: data.dollarValue,
        id: data.categoryId,
        budget: budgetData!.amount
    });
};
