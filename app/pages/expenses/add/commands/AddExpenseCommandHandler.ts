import type { ICurrenciesRepository } from "../../../../data/repositories/expenses/ICurrenciesRepository";
import type { IExpenseShopsRepository } from "../../../../data/repositories/expenses/IExpenseShopsRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IAddExpenseRouteParams } from "../AddExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { PageRequestBody } from "../../../page/IBasePageRequestBody";
import type { IExpenseFormData } from "../../ExpenseForm";
import { CommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";
import { ExpensesUtils } from "../../../../model/ExpensesUtils";

export class AddExpenseCommandHandler extends CommandHandler<IAddExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _currenciesRepository:ICurrenciesRepository;
    private readonly _expensesRepository: IExpensesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, currenciesRepository, expensesRepository, expenseTagsRepository, expenseShopsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._currenciesRepository = currenciesRepository;
        this._expensesRepository = expensesRepository;
        this._expenseTagsRepository = expenseTagsRepository;
        this._expenseShopsRepository = expenseShopsRepository;
    }

    public async executeCommandAsync(routeParams: IAddExpenseRouteParams, requestBody: PageRequestBody<IExpenseFormData>, queryParmas: {}): Promise<IRequestResult> {
        const form = await ExpenseForm.initializeAsync(requestBody, this._translation, this._currenciesRepository, this._expenseTagsRepository, this._expenseShopsRepository);
        form.validate();

        if (form.isValid)
            try {
                await this._expensesRepository.addAsync({
                    name: form.name.value!,
                    shop: form.shop.value!,
                    tags: form.tags.value,
                    price: form.price.value!,
                    currency: form.currency.value!,
                    quantity: form.quantity.value!,
                    date: form.date.value!
                });
                return this.redirect(`/expenses/${ExpensesUtils.getExpenseMonth(form.date.value!)}`);
            }
            catch {
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