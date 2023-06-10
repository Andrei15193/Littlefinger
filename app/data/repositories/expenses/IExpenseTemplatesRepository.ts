import type { WithoutAnyEtag, WithoutAnyState } from "../../../model/common";
import type { IExpenseTemplate } from "../../../model/Expenses";

export interface IExpenseTemplatesRepository {
    getAllAsync(): Promise<readonly IExpenseTemplate[]>;

    addAsync(expenseTemplate: WithoutAnyEtag<WithoutAnyState<Omit<IExpenseTemplate, "id" | "amount">>>): Promise<void>;
}