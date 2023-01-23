import type { IBaseViewOptions } from "../../page/IBaseViewOptions";
import type { IExpenseShop } from "../../../model/Expenses";

export interface IListExpenseShopsRouteParams {
}

export interface IListExpenseShopsViewOptions extends IBaseViewOptions {
    readonly expenseShops: readonly IExpenseShop[];
}