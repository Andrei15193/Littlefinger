import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IRequestResult } from "../../../page/results";
import type { ExpenseForm } from "../../../expenses/ExpenseForm";
import type { IExpenseFormViewOptions } from "../../../expenses/IExpenseFormViewOptions";
import type { IAddExpenseFromTemplateRouteParams } from "../AddExpenseFromTemplatePageDefinition";
import type { IExpensePageRequestFormBody } from "../../../expenses/IExpensePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpensesUtils } from "../../../../model/ExpensesUtils";

export class AddExpenseFromTemplateCommandHandler extends FormCommandHandler<ExpenseForm, IAddExpenseFromTemplateRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ translation, expensesRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
    }

    public async executeCommandAsync(form: ExpenseForm, routeParams: IAddExpenseFromTemplateRouteParams, requestBody: IExpensePageRequestFormBody, queryParmas: {}): Promise<IRequestResult> {
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
                form.error = this._translation.expenses.form.error.unknown;

                return this.render("expenseTemplates/add-expense", {
                    title: this._translation.expenses.add.title,
                    tab: "expenses",
                    state: "ready",
                    form
                });
            }
        else {
            return this.render("expenseTemplates/add-expense", {
                title: this._translation.expenses.add.title,
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}