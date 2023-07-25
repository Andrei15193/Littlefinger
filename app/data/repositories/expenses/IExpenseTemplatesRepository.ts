import type { WithoutAnyEtag, WithoutAnyState, WithoutRelatedEtags } from "../../../model/common";
import type { IExpenseTemplate } from "../../../model/Expenses";

export interface IExpenseTemplatesRepository {
    getAsync(expenseTemplateId: string): Promise<IExpenseTemplate>;

    getAllAsync(): Promise<readonly IExpenseTemplate[]>;

    addAsync(expenseTemplate: WithoutAnyEtag<WithoutAnyState<Omit<IExpenseTemplate, "id" | "amount">>>): Promise<void>;

    updateAsync(expense: WithoutRelatedEtags<WithoutAnyState<Omit<IExpenseTemplate, "amount">>>): Promise<void>;

    removeAsync(expenseTemplateId: string, expenseTemplateEtag: string): Promise<void>;
}