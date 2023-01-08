import type { IBaseViewOptions } from "../page";
import type { ExpenseState, IExpenseWarning } from "../../model/Expenses";
import type { ExpenseForm } from "./ExpenseForm";

export interface IExpenseFormViewOptions extends IBaseViewOptions {
    readonly state: ExpenseState;
    readonly warning?: IExpenseWarning;

    readonly form: ExpenseForm;
}