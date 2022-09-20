import type { IBaseViewOptions } from "../page";
import type { ExpenseForm } from "./ExpenseForm";

export interface IExpenseFormViewOptions extends IBaseViewOptions {
    readonly form: ExpenseForm;
}