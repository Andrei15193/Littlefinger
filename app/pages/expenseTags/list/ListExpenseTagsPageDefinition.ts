import type { IBaseViewOptions } from "../../page/IBaseViewOptions";
import type { IBaseFormPageRequestBody } from "../../page/IBaseFormPageRequestBody";
import type { IExpenseTag } from "../../../model/Expenses";
import type { ExpenseTagForm } from "../ExpenseTagForm";

export interface IListExpenseTagsRouteParams {
}

export interface IListExpenseTagsViewOptions extends IBaseViewOptions {
    readonly form: ExpenseTagForm;
    readonly expenseTags: readonly IExpenseTag[];
}

export interface IModifyExpenseTagsRequestBody extends IBaseFormPageRequestBody {
    readonly name: string;
}