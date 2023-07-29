import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IAddExpenseFromTemplateRouteParams } from "../AddExpenseFromTemplatePageDefinition";
import type { IRequestResult } from "../../../page/results";
import type { IExpensePageRequestFormBody } from "../../../expenses/IExpensePageRequestFormBody";
import type { IExpenseFormViewOptions } from "../../../expenses/IExpenseFormViewOptions";
import type { ExpenseForm } from "../../../expenses/ExpenseForm";
import { FormCommandHandler } from "../../../page";

export class AddExpenseTagCommandHandler extends FormCommandHandler<ExpenseForm, IAddExpenseFromTemplateRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public async executeCommandAsync(form: ExpenseForm, routeParams: IAddExpenseFromTemplateRouteParams, requestBody: IExpensePageRequestFormBody, queryParmas: {}): Promise<IRequestResult> {
        if (form.tags.value.indexOf("") === -1) {
            form.tags.value = ["", ...form.tags.value];
            if (form.isValidated)
                form.validate();
        }

        return this.render("expenseTemplates/add-expense", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            state: "ready",
            form
        });
    }
}