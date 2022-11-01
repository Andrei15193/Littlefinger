import type { IBaseViewOptions } from "../page";
import type { ExpenseForm } from "./ExpenseForm";
import type { ExpenseState, IExpenseWarning } from "../../model/Expenses";

export interface IExpenseFormViewOptions extends IBaseViewOptions {
    readonly state: ExpenseState;
    readonly warning?: IExpenseWarning;

    readonly form: ExpenseForm;
}