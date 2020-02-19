export interface ILoggedUser {
    uid: string;
    displayName: string|null;
    photoURL: string|null;
    email: string|null;
}

export interface IAddExpense {
    select: string;
    amount: string;
    expDate: any;
    notes: string;
}

export interface IExpenses  {
    amount: string;
    category: string;
    categoryId: number;
    dateStamp: number;
    dollarValue: string;
    expDate: number;
    expDateFull: string;
    expMonth: number;
    expYear: number;
    userId: string;
    id: string;
    notes?: string;
}

export interface ICategoryData {
    amount: number;
    category: string;
    categoryId: number
    dollarValue: string;
    id: number;
}