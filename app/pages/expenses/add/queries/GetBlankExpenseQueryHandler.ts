import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IAddExpenseRouteParams } from "../AddExpensePageDefinition";
import type { IRequestResult } from "../../../page/results";
import type { IUser } from "../../../../model/Users";
import { FormQueryHandler } from "../../../page";
import { ExpensesUtils } from "../../../../model/ExpensesUtils";
import { ExpenseForm } from "../../ExpenseForm";

export class GetBlankExpenseQueryHandler extends FormQueryHandler<ExpenseForm, IAddExpenseRouteParams, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _user: IUser;

    public constructor({ translation, user }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._user = user!;
    }

    public async executeQueryAsync(form: ExpenseForm, { month: routeMonth }: IAddExpenseRouteParams, queryParmas: {}): Promise<IRequestResult> {
        form.currency.value = this._user.defaultCurrency;
        form.quantity.value = 1;
        form.date.value =
            routeMonth === null || routeMonth === undefined || ExpensesUtils.getExpenseMonth(new Date()) === routeMonth
                ? new Date()
                : routeMonth;

        return this.render("expenses/add", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            state: "ready",
            form
        });
    }
}