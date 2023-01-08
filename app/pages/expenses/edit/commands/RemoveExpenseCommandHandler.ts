import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class RemoveExpenseCommandHandler extends FormCommandHandler<ExpenseForm, IEditExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions>  {
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

            try {
                await this._expensesRepository.removeAsync(expenseMonth, expenseId, form.etag!);
                return this.redirect(`/expenses/${expenseMonth}`);
            }
            catch (error) {
                const dataStorageError = error as DataStorageError;
                form.error = dataStorageError.map({
                    invalidEtag: this._translation.expenses.form.error.invalidEtag,
                    unknown: this._translation.expenses.form.error.unknown
                })

                return dataStorageError.map<IRequestResult>({
                    notFound: () => this.redirect(`/expenses/${expenseMonth}`),
                    unknown: () => this.render("expenses/edit", {
                        title: this._translation.expenses.edit.title(expenseId),
                        tab: "expenses",
                        state: expense.state,
                        warning: expense.warning,
                        form
                    })
                });
            }
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