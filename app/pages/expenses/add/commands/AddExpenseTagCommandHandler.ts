import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IAddExpenseRouteParams } from "../AddExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import { FormCommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class AddExpenseTagCommandHandler extends FormCommandHandler<ExpenseForm, IAddExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public async executeCommandAsync(form: ExpenseForm, routeParams: IAddExpenseRouteParams, requestBody: IExpensePageRequestFormBody, queryParmas: {}): Promise<IRequestResult> {
        if (form.tags.value.indexOf("") === -1) {
            form.tags.value = ["", ...form.tags.value];
            if (form.isValidated)
                form.validate();
        }

        return this.render("expenses/add", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            state: "ready",
            form
        });
    }
}