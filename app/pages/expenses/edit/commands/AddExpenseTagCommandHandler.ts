import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { ExpenseForm } from "../../ExpenseForm";
import { FormCommandHandler } from "../../../page";

export class AddExpenseTagCommandHandler extends FormCommandHandler<ExpenseForm, IEditExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ translation, expensesRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
    }

    public async executeCommandAsync(form: ExpenseForm, { month: expenseMonth, id: expenseId }: IEditExpenseRouteParams): Promise<IRequestResult> {
        try {
            const expense = await this._expensesRepository.getAsync({ month: expenseMonth, id: expenseId });
            if (expense.state !== "ready") {
                form.error = this._translation.expenses.form.error.notEditable;
                return this.render("expenses/edit", {
                    title: this._translation.expenses.edit.title(expenseId),
                    tab: "expenses",
                    state: expense.state,
                    warning: expense.warning,
                    form,
                });
            }

            if (form.tags.value.indexOf("") === -1) {
                form.tags.value = ["", ...form.tags.value];
                if (form.isValidated)
                    form.validate();
            }

            return this.render("expenses/edit", {
                title: this._translation.expenses.edit.title(expenseId),
                tab: "expenses",
                state: expense.state,
                warning: expense.warning,
                form
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            form.error = dataStorageError.map<IFormError>({
                notFound: this._translation.expenses.form.error.notFound(expenseMonth),
                unknown: this._translation.expenses.form.error.unknown
            });
            return this.render("expenses/edit-not-found", {
                title: this._translation.expenses.edit.title(expenseId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}