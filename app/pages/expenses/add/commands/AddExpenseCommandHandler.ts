import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IAddExpenseRouteParams } from "../AddExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpensesUtils } from "../../../../model/ExpensesUtils";
import { ExpenseForm } from "../../ExpenseForm";

export class AddExpenseCommandHandler extends FormCommandHandler<ExpenseForm, IAddExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ translation, expensesRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
    }

    public async executeCommandAsync(form: ExpenseForm, routeParams: IAddExpenseRouteParams, requestBody: IExpensePageRequestFormBody, queryParmas: {}): Promise<IRequestResult> {
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
                console.error(error);
                form.error = this._translation.expenses.form.error.unknown;

                return this.render("expenses/add", {
                    title: this._translation.expenses.add.title,
                    tab: "expenses",
                    state: "ready",
                    form
                });
            }
        else {
            return this.render("expenses/add", {
                title: this._translation.expenses.add.title,
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}