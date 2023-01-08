import type { IExpenseTag } from "../../../model/Expenses";

export interface IExpenseTagsRepository {
    getAllAsync(): Promise<readonly IExpenseTag[]>;

    getAllByNameAsync(): Promise<{ readonly [tagName: string]: IExpenseTag; }>;

    addAsync(expenseTag: Omit<IExpenseTag, "etag">): Promise<void>;
}