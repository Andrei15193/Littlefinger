import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IExpenseTemplateFormViewOptions } from "../../IExpenseTemplateFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IUser } from "../../../../model/Users";
import { FormQueryHandler } from "../../../page";
import { ExpenseTemplateForm } from "../../ExpenseTemplateForm";

export class GetBlankExpenseTemplateQueryHandler extends FormQueryHandler<ExpenseTemplateForm, {}, IExpenseTemplateFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _user: IUser;

    public constructor({ translation, user }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._user = user!;
    }

    public async executeQueryAsync(form: ExpenseTemplateForm, routeParams: {}, queryParmas: {}): Promise<IRequestResult> {
        form.currency.value = this._user.defaultCurrency;
        form.quantity.value = 1;
        form.dayOfMonth.value = 1;

        return this.render("expenseTemplates/add", {
            title: this._translation.expenseTemplates.add.title,
            tab: "expenses",
            form
        });
    }
}