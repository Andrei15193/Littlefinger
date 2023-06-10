import type { IBaseViewOptions } from "../page";
import type { ExpenseTemplateForm } from "./ExpenseTemplateForm";

export interface IExpenseTemplateFormViewOptions extends IBaseViewOptions {
    readonly form: ExpenseTemplateForm;
}