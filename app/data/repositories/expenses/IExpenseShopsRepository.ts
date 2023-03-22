import type { IExpenseShop } from "../../../model/Expenses";

export interface IExpenseShopsRepository {
    getByNameAsync(shopName: string): Promise<IExpenseShop>;

    getAllAsync(): Promise<readonly IExpenseShop[]>;

    renameAsync(initialExpenseShopName: string, initialExpenseShopEtag: string, newExpenseShopName: string): Promise<void>;

    removeAsync(expenseShopName: string, etag: string): Promise<void>;
}