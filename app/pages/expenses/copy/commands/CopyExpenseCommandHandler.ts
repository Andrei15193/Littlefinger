import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { ICopyExpenseRouteParams } from "../CopyExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";
import { ExpensesUtils } from "../../../../model/ExpensesUtils";

export class CopyExpenseCommandHandler extends FormCommandHandler<ExpenseForm, ICopyExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ translation, expensesRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
    }

    public async executeCommandAsync(form: ExpenseForm, { month: expenseMonth, id: expenseId }: ICopyExpenseRouteParams): Promise<IRequestResult> {
        try {
            form.validate();
            if (form.isValid)
                try {
                    await this._expensesRepository.addAsync({
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
                        date: form.date.value!
                    });

                    return this.redirect(`/expenses/${ExpensesUtils.getExpenseMonth(form.date.value!)}`);
                }
                catch (error) {
                    const dataStorageError = error as DataStorageError;
                    form.error = dataStorageError.map({
                        invalidEtag: this._translation.expenses.form.error.invalidEtag,
                        unknown: this._translation.expenses.form.error.unknown
                    });

                    return this.render("expenses/copy", {
                        title: this._translation.expenses.copy.title(expenseId),
                        tab: "expenses",
                        state: "ready",
                        form
                    });
                }
            else {
                return this.render("expenses/copy", {
                    title: this._translation.expenses.copy.title(expenseId),
                    tab: "expenses",
                    state: "ready",
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
                title: this._translation.expenses.copy.title(expenseId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}