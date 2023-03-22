import type { WithoutAnyEtag, WithoutRelatedEtags, WithoutAnyState } from "../../../model/common";
import type { IExpense, IExpenseKey } from "../../../model/Expenses";

export interface IExpensesRepository {
    getAsync(expenseKey: IExpenseKey): Promise<IExpense>;

    getAllAsync(expensesMonth: string): Promise<readonly IExpense[]>;

    addAsync(expense: WithoutAnyEtag<WithoutAnyState<Omit<IExpense, "key" | "amount">>>): Promise<void>;

    updateAsync(expense: WithoutRelatedEtags<WithoutAnyState<Omit<IExpense, "amount">>>): Promise<void>;

    removeAsync(expenseMonth: string, expenseId: string, expenseEtag: string): Promise<void>;
}