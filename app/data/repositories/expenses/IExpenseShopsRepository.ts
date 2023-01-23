import type { IExpenseShop } from "../../../model/Expenses";

export interface IExpenseShopsRepository {
    getByNameAsync(shopName: string): Promise<IExpenseShop | null>;

    getAllAsync(): Promise<readonly IExpenseShop[]>;

    addAsync(expenseShop: Omit<IExpenseShop, "etag">): Promise<void>;

    removeAsync(expenseShopName: string, etag: string): Promise<void>;
}