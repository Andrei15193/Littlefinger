import type { IBaseViewOptions } from "../../page/IBaseViewOptions";
import type { IBaseFormPageRequestBody } from "../../page/IBaseFormPageRequestBody";
import type { IExpenseShop } from "../../../model/Expenses";
import type { ExpenseShopForm } from "../ExpenseShopForm";

export interface IListExpenseShopsRouteParams {
}

export interface IListExpenseShopsViewOptions extends IBaseViewOptions {
    readonly form: ExpenseShopForm;
    readonly expenseShops: readonly IExpenseShop[];
}

export interface IModifyExpenseShopsRequestBody extends IBaseFormPageRequestBody {
    readonly name: string;
}