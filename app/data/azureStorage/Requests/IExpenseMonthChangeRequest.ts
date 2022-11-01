import type { IExpenseKey } from "../../../model/Expenses";

export interface IExpenseMonthChangeRequest {
    readonly userId: string;
    readonly expenseKey: IExpenseKey;
    readonly newExpenseDateString: string;
}