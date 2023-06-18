import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IEditExpenseTemplateRouteParams } from "../EditExpenseTemplatePageDefinition";
import type { IExpenseTemplateFormViewOptions } from "../../IExpenseTemplateFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseTemplatePageRequestFormBody } from "../../IExpenseTemplatePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseTemplateForm } from "../../ExpenseTemplateForm";

export class AddExpenseTemplateTagCommandHandler extends FormCommandHandler<ExpenseTemplateForm, IEditExpenseTemplateRouteParams, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public async executeCommandAsync(form: ExpenseTemplateForm, { id: expenseTemplateId }: IEditExpenseTemplateRouteParams, requestBody: IExpenseTemplatePageRequestFormBody, queryParmas: {}): Promise<IRequestResult> {
        if (form.tags.value.indexOf("") === -1) {
            form.tags.value = ["", ...form.tags.value];
            if (form.isValidated)
                form.validate();
        }

        return this.render("expenseTemplates/edit", {
            title: this._translation.expenseTemplates.edit.title(expenseTemplateId),
            tab: "expenses",
            form
        });
    }
}