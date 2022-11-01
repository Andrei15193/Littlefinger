import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { PageRequestBody } from "../../../page/IBasePageRequestBody";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseFormData } from "../../ExpenseForm";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { CommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class AddExpenseTagCommandHandler extends CommandHandler<IEditExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ translation, expensesRepository, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeCommandAsync({ month: expenseMonth, id: expenseId }: IEditExpenseRouteParams, requestBody: PageRequestBody<IExpenseFormData>, queryParmas: {}): Promise<IRequestResult> {
        try {
            const form = await ExpenseForm.initializeAsync(requestBody, this._translation, this._expenseTagsRepository);

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

            form.addTag();
            if (form.isValidated)
                form.validate();

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
            const form = ExpenseForm.initializeFaulted(
                dataStorageError.map<IFormError>({
                    notFound: this._translation.expenses.form.error.notFound(expenseMonth),
                    unknown: this._translation.expenses.form.error.unknown
                }),
                this._translation
            );
            return this.render("expenses/edit-not-found", {
                title: this._translation.expenses.edit.title(expenseId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}