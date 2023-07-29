import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IExpenseTemplatesRepository } from "../../../../data/repositories/expenses/IExpenseTemplatesRepository";
import type { IExpenseTemplateFormViewOptions } from "../../IExpenseTemplateFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseTemplatePageRequestFormBody } from "../../IExpenseTemplatePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseTemplateForm } from "../../ExpenseTemplateForm";

export class AddExpenseTemplateCommandHandler extends FormCommandHandler<ExpenseTemplateForm, {}, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpenseTemplatesRepository;

    public constructor({ translation, expenseTemplatesRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expenseTemplatesRepository;
    }

    public async executeCommandAsync(form: ExpenseTemplateForm, routeParams: {}, requestBody: IExpenseTemplatePageRequestFormBody, queryParmas: {}): Promise<IRequestResult> {
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
                    dayOfMonth: form.dayOfMonth.value!
                });
                return this.redirect("/expense-templates");
            }
            catch (error) {
                form.error = this._translation.expenses.form.error.unknown;

                return this.render("expenseTemplates/add", {
                    title: this._translation.expenses.add.title,
                    tab: "expenses",
                    form
                });
            }
        else {
            return this.render("expenseTemplates/add", {
                title: this._translation.expenses.add.title,
                tab: "expenses",
                form
            });
        }
    }
}