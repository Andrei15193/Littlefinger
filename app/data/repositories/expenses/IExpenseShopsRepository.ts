import type { IExpenseShop } from "../../../model/Expenses";

export interface IExpenseShopsRepository {
    getAllAsync(): Promise<readonly IExpenseShop[]>;

    addAsync(expenseShop: Omit<IExpenseShop, "etag">): Promise<void>;
}