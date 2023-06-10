import type { IBaseViewOptions } from "../../page/IBaseViewOptions";
import type { IExpenseTemplate } from "../../../model/Expenses";

export interface IListExpenseTemplatesRouteParams {
}

export interface IListExpenseTemplatesViewOptions extends IBaseViewOptions {
    readonly expenseTemplates: readonly IExpenseTemplate[];
}