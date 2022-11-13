import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import type { IExpenseFormData } from "../../ExpenseForm";
import type { PageRequestBody } from "../../../page/IBasePageRequestBody";
import { CommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class RemoveExpenseCommandHandler extends CommandHandler<IEditExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions>  {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expensesRepository, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeCommandAsync({ month: expenseMonth, id: expenseId }: IEditExpenseRouteParams, requestBody: PageRequestBody<IExpenseFormData>, queryParmas: {}): Promise<IRequestResult> {
        try {
            const expense = await this._expensesRepository.getAsync({ month: expenseMonth, id: expenseId });
            const form = await ExpenseForm.initializeAsync(
                {
                    validated: requestBody.validated,
                    etag: requestBody.etag,

                    name: expense.name,
                    shop: expense.shop,
                    tags: expense.tags.map(tag => tag.name),
                    price: expense.price,
                    currency: expense.currency,
                    quantity: expense.quantity,
                    date: expense.date.toISOString()
                },
                this._translation,
                this._expenseTagsRepository
            );

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