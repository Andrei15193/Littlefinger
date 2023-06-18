import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { IExpenseTemplateFormViewOptions } from "../../IExpenseTemplateFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IEditExpenseTemplateRouteParams } from "../EditExpenseTemplatePageDefinition";
import type { IExpenseTemplatesRepository } from "../../../../data/repositories/expenses/IExpenseTemplatesRepository";
import { FormQueryHandler } from "../../../page";
import { ExpenseTemplateForm } from "../../ExpenseTemplateForm";
import { DataStorageError } from "../../../../data/DataStorageError";

export class GetExpenseTemplateQueryHandler extends FormQueryHandler<ExpenseTemplateForm, IEditExpenseTemplateRouteParams, IExpenseTemplateFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseTemplatesRepository: IExpenseTemplatesRepository;

    public constructor({ translation, expenseTemplatesRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseTemplatesRepository = expenseTemplatesRepository;
    }

    public async executeQueryAsync(form: ExpenseTemplateForm, {id: expenseTemplateId}: IEditExpenseTemplateRouteParams, queryParmas: {}): Promise<IRequestResult> {
        try {
            const expenseTemplate = await this._expenseTemplatesRepository.getAsync(expenseTemplateId);

            form.name.value = expenseTemplate.name;
            form.shop.value = expenseTemplate.shop;
            form.tags.value = expenseTemplate.tags.map(tag => tag.name);
            form.price.value = expenseTemplate.price;
            form.currency.value = expenseTemplate.currency;
            form.quantity.value = expenseTemplate.quantity;
            form.dayOfMonth.value = expenseTemplate.dayOfMonth;

            form.etag = expenseTemplate.etag;

            return this.render("expenseTemplates/edit", {
                title: this._translation.expenses.edit.title(expenseTemplateId),
                tab: "expenses",
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
                title: this._translation.expenses.edit.title(expenseTemplateId),
                tab: "expenses",
                form
            });
        }
    }
}