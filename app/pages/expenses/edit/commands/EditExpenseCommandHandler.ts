import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class EditExpenseCommandHandler extends FormCommandHandler<ExpenseForm, IEditExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expensesRepository, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expenseTagsRepository = expenseTagsRepository;
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
                        tags: form
                            .tags
                            .value
                            .filter(expenseTagName => expenseTagName.length > 0)
                            .map(expenseTagName => ({
                                name: expenseTagName,
                                color: form.expenseTagsByName[expenseTagName]!.color
                            })),
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