import type { IBaseViewOptions } from "../../page/IBaseViewOptions";
import type { IExpenseShop } from "../../../model/Expenses";
import type { IBasePageRequestBody } from "../../page/IBasePageRequestBody";

export interface IListExpenseShopsRouteParams {
}

export interface IListExpenseShopsViewOptions extends IBaseViewOptions {
    readonly expenseShops: readonly IExpenseShop[];
    readonly errorMessage?: string;
}

export interface IModifyExpenseShopsRequestBody extends IBasePageRequestBody {
    readonly name: string;
    readonly etag: string;
}