import type { WithoutEtag, WithoutState } from "../../../model/common";
import type { IExpenseTag } from "../../../model/Expenses";

export interface IExpenseTagsRepository {
    getByNameAsync(tagName: string): Promise<IExpenseTag>;

    getAllAsync(): Promise<readonly IExpenseTag[]>;

    getAllByNameAsync(): Promise<{ readonly [tagName: string]: IExpenseTag; }>;

    updateAsync(initialExpenseTagName: string, initialExpenseTagEtag: string, expenseTag: WithoutEtag<WithoutState<IExpenseTag>>): Promise<void>;

    removeAsync(ExpenseTagName: string, expenseTagEtag: string): Promise<void>;
}