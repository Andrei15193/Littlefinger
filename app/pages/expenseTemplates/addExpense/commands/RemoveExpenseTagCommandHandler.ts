import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IAddExpenseFromTemplateRouteParams } from "../AddExpenseFromTemplatePageDefinition";
import type { IRequestResult } from "../../../page/results";
import type { IExpensePageRequestFormBody } from "../../../expenses/IExpensePageRequestFormBody";
import type { IExpenseFormViewOptions } from "../../../expenses/IExpenseFormViewOptions";
import type { ExpenseForm } from "../../../expenses/ExpenseForm";
import { FormCommandHandler } from "../../../page";

export class RemoveExpenseTagCommandHandler extends FormCommandHandler<ExpenseForm, IAddExpenseFromTemplateRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public async executeCommandAsync(form: ExpenseForm, routeParams: IAddExpenseFromTemplateRouteParams, requestBody: IExpensePageRequestFormBody, queryParmas: {}, tag: string): Promise<IRequestResult> {
        const tagIndexToRemove = form.tags.value.indexOf(tag!);
        if (tagIndexToRemove >= 0)
            form.tags.value = form.tags.value.slice(0, tagIndexToRemove).concat(form.tags.value.slice(tagIndexToRemove + 1));

        if (form.isValidated)
            form.validate();

        return this.render("expenseTemplates/add-expense", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            state: "ready",
            form
        });
    }
}