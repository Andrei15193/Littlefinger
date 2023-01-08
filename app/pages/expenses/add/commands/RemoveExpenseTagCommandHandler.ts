import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IAddExpenseRouteParams } from "../AddExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class RemoveExpenseTagCommandHandler extends FormCommandHandler<ExpenseForm, IAddExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public async executeCommandAsync(form: ExpenseForm, routeParams: IAddExpenseRouteParams, requestBody: IExpensePageRequestFormBody, queryParmas: {}, tag: string): Promise<IRequestResult> {
        const tagIndexToRemove = form.tags.value.indexOf(tag!);
        if (tagIndexToRemove >= 0)
            form.tags.value = form.tags.value.slice(0, tagIndexToRemove).concat(form.tags.value.slice(tagIndexToRemove + 1));

        if (form.isValidated)
            form.validate();

        return this.render("expenses/add", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            state: "ready",
            form
        });
    }
}