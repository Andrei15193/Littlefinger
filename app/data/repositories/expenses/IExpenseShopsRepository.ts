import type { IExpenseShop } from "../../../model/Expenses";

export interface IExpenseShopsRepository {
    getByNameAsync(shopName: string): Promise<IExpenseShop>;

    getAllAsync(): Promise<readonly IExpenseShop[]>;

    renameAsync(initialExpenseShopName: string, newExpenseShopName: string, etag: string): Promise<void>;

    removeAsync(expenseShopName: string, etag: string): Promise<void>;
}