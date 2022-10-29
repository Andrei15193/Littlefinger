import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/translation";
import type { IUser } from "../../../../model/Users";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IAddExpenseRouteParams } from "../AddExpensePageDefinition";
import type { IRequestResult } from "../../../page/results";
import { QueryHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class GetBlankExpenseQueryHandler extends QueryHandler<IAddExpenseRouteParams, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _user: IUser;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, user, expenseTagsRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._user = user;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeQueryAsync({ month: routeMonth }: IAddExpenseRouteParams, queryParmas: {}): Promise<IRequestResult> {
        const form = await ExpenseForm.initializeAsync(
            {
                validated: "false",
                etag: null,

                name: "",
                shop: "",
                tags: [],
                price: 0,
                currency: this._user.defaultCurrency,
                quantity: 1,
                date: routeMonth === null || routeMonth === undefined ? new Date().toISOString() : routeMonth
            },
            this._translation,
            this._expenseTagsRepository
        );

        return this.render("expenses/add", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            form
        });
    }
}