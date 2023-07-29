import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { IExpenseFormViewOptions } from "../../../expenses/IExpenseFormViewOptions";
import type { IAddExpenseFromTemplateRouteParams } from "../AddExpenseFromTemplatePageDefinition";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseTemplatesRepository } from "../../../../data/repositories/expenses/IExpenseTemplatesRepository";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { FormQueryHandler } from "../../../page";
import { ExpenseForm } from "../../../expenses/ExpenseForm";

export class GetFilledExpenseQueryHandler extends FormQueryHandler<ExpenseForm, IAddExpenseFromTemplateRouteParams, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseTemplatesRepository: IExpenseTemplatesRepository;

    public constructor({ translation, expenseTemplatesRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseTemplatesRepository = expenseTemplatesRepository;
    }

    public async executeQueryAsync(form: ExpenseForm, { id: expenseTemplateId }: IAddExpenseFromTemplateRouteParams, queryParmas: {}): Promise<IRequestResult> {
        try {
            const expenseTemplate = await this._expenseTemplatesRepository.getAsync(expenseTemplateId);

            form.name.value = expenseTemplate.name;
            form.shop.value = expenseTemplate.shop;
            form.tags.value = expenseTemplate.tags.map(tag => tag.name);
            form.currency.value = expenseTemplate.currency;
            form.price.value = expenseTemplate.price;
            form.quantity.value = expenseTemplate.quantity;

            const currentDate = new Date();
            const currentMonth = currentDate.getUTCMonth();
            currentDate.setUTCDate(expenseTemplate.dayOfMonth);
            while (currentMonth !== currentDate.getUTCMonth())
                currentDate.setUTCDate(currentDate.getUTCDate() - 1);
            form.date.value = currentDate;

            return this.render("expenseTemplates/add-expense", {
                title: this._translation.expenses.add.title,
                tab: "expenses",
                state: "ready",
                form
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            form.error = dataStorageError.map<IFormError>({
                notFound: this._translation.expenseTemplates.form.error.notFound,
                unknown: this._translation.expenseTemplates.form.error.unknown
            });
            return this.render("expenseTemplates/edit-not-found", {
                title: this._translation.expenseTemplates.edit.title(expenseTemplateId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}