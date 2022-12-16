import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IExpenseShopsRepository } from "../../../../data/repositories/expenses/IExpenseShopsRepository";
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

export class EditExpenseCommandHandler extends CommandHandler<IEditExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, expensesRepository, expenseTagsRepository, expenseShopsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
        this._expenseTagsRepository = expenseTagsRepository;
        this._expenseShopsRepository = expenseShopsRepository;
    }

    public async executeCommandAsync({ month: expenseMonth, id: expenseId }: IEditExpenseRouteParams, requestBody: PageRequestBody<IExpenseFormData>, queryParmas: {}): Promise<IRequestResult> {
        try {
            const form = await ExpenseForm.initializeAsync(requestBody, this._translation, this._expenseTagsRepository, this._expenseShopsRepository);

            const expense = await this._expensesRepository.getAsync({ month: expenseMonth, id: expenseId });
            if (expense.state !== "ready") {
                form.error = this._translation.expenses.form.error.notEditable;
                return this.render("expenses/edit", {
                    title: this._translation.expenses.edit.title(expenseId),
                    tab: "expenses",
                    state: expense.state,
                    warning: expense.warning,
                    form
                });
            }

            form.validate();
            if (form.isValid)
                try {
                    await this._expensesRepository.updateAsync({
                        key: {
                            month: expenseMonth,
                            id: expenseId
                        },
                        name: form.name.value!,
                        shop: form.shop.value!,
                        tags: form.tags.value,
                        price: form.price.value!,
                        currency: form.currency.value!,
                        quantity: form.quantity.value!,
                        date: form.date.value!,
                        etag: form.etag!
                    });

                    return this.redirect(`/expenses/${expenseMonth}`);
                }
                catch (error) {
                    const dataStorageError = error as DataStorageError;
                    form.error = dataStorageError.map({
                        invalidEtag: this._translation.expenses.form.error.invalidEtag,
                        unknown: this._translation.expenses.form.error.unknown
                    });

                    return this.render("expenses/edit", {
                        title: this._translation.expenses.edit.title(expenseId),
                        tab: "expenses",
                        state: expense.state,
                        warning: expense.warning,
                        form
                    });
                }
            else {
                return this.render("expenses/edit", {
                    title: this._translation.expenses.edit.title(expenseId),
                    tab: "expenses",
                    state: expense.state,
                    warning: expense.warning,
                    form
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