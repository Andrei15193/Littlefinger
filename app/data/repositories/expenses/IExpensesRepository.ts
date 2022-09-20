import { IExpense, IExpenseKey } from "../../../model/Expenses";

export interface IExpensesRepository {
    getAsync(expenseKey: IExpenseKey): Promise<IExpense>;

    getAllAsync(expensesMonth: string): Promise<readonly IExpense[]>;

    addAsync(expense: WithoutAnyEtag<Omit<IExpense, "key" | "amount">>): Promise<void>;

    updateAsync(expense: WithoutRelatedEtags<Omit<IExpense, "amount">>): Promise<void>;

    removeAsync(expenseMonth: string, expenseId: string, expenseEtag: string): Promise<void>;
}