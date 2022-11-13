import type { IExpenseTag } from "../../../model/Expenses";

export interface IExpenseTagsRepository {
    getAllAsync(): Promise<readonly IExpenseTag[]>;

    getAllByName(): Promise<{ readonly [tagName: string]: IExpenseTag; }>;

    addAsync(expenseTag: Omit<IExpenseTag, "etag">): Promise<void>;
}