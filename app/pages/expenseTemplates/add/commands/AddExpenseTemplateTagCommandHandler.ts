import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IExpenseTemplateFormViewOptions } from "../../IExpenseTemplateFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseTemplatePageRequestFormBody } from "../../IExpenseTemplatePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseTemplateForm } from "../../ExpenseTemplateForm";

export class AddExpenseTemplateTagCommandHandler extends FormCommandHandler<ExpenseTemplateForm, {}, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public async executeCommandAsync(form: ExpenseTemplateForm, routeParams: {}, requestBody: IExpenseTemplatePageRequestFormBody, queryParmas: {}): Promise<IRequestResult> {
        if (form.tags.value.indexOf("") === -1) {
            form.tags.value = ["", ...form.tags.value];
            if (form.isValidated)
                form.validate();
        }

        return this.render("expenseTemplates/add", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            form
        });
    }
}