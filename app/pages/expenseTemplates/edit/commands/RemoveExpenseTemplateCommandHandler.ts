import type { IExpenseTemplatesRepository } from "../../../../data/repositories/expenses/IExpenseTemplatesRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IEditExpenseTemplateRouteParams } from "../EditExpenseTemplatePageDefinition";
import type { IExpenseTemplateFormViewOptions } from "../../IExpenseTemplateFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import type { IExpenseTemplatePageRequestFormBody } from "../../IExpenseTemplatePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseTemplateForm } from "../../ExpenseTemplateForm";

export class RemoveExpenseTemplateCommandHandler extends FormCommandHandler<ExpenseTemplateForm, IEditExpenseTemplateRouteParams, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions>  {
    private readonly _translation: ITranslation;
    private readonly _expenseTemplatesRepository: IExpenseTemplatesRepository;

    public constructor({ translation, expenseTemplatesRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expenseTemplatesRepository = expenseTemplatesRepository;
    }

    public async executeCommandAsync(form: ExpenseTemplateForm, { id: expenseTemplateId }: IEditExpenseTemplateRouteParams): Promise<IRequestResult> {
        try {
            await this._expenseTemplatesRepository.removeAsync(expenseTemplateId, form.etag!);
            return this.redirect("/expense-templates");
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            form.error = dataStorageError.map({
                invalidEtag: this._translation.expenses.form.error.invalidEtag,
                unknown: this._translation.expenses.form.error.unknown
            });

            return dataStorageError.map<IRequestResult>({
                notFound: this.redirect("/expense-templates"),
                unknown: this.render("expenseTemplates/edit", {
                    title: this._translation.expenses.edit.title(expenseTemplateId),
                    tab: "expenses",
                    form
                })
            });
        }
    }
}