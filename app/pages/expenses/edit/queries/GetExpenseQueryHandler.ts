import type { ICurrenciesRepository } from "../../../../data/repositories/expenses/ICurrenciesRepository";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IExpenseShopsRepository } from "../../../../data/repositories/expenses/IExpenseShopsRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { QueryHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class GetExpenseQueryHandler extends QueryHandler<IEditExpenseRouteParams, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _currenciesRepository: ICurrenciesRepository;
    private readonly _expensesRepository: IExpensesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, currenciesRepository, expensesRepository, expenseTagsRepository, expenseShopsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._currenciesRepository = currenciesRepository;
        this._expensesRepository = expensesRepository;
        this._expenseTagsRepository = expenseTagsRepository;
        this._expenseShopsRepository = expenseShopsRepository;
    }

    public async executeQueryAsync({ month: expenseMonth, id: expenseId }: IEditExpenseRouteParams, queryParmas: {}): Promise<IRequestResult> {
        try {
            const expense = await this._expensesRepository.getAsync({ month: expenseMonth, id: expenseId });
            const form = await ExpenseForm.initializeAsync(
                {
                    validated: "false",
                    etag: expense.etag,

                    name: expense.name,
                    shop: expense.shop,
                    tags: expense.tags.map(tag => tag.name),
                    price: expense.price,
                    currency: expense.currency,
                    quantity: expense.quantity,
                    date: expense.date.toISOString()
                },
                this._translation,
                this._currenciesRepository,
                this._expenseTagsRepository,
                this._expenseShopsRepository
            );

            return this.render("expenses/edit", {
                title: this._translation.expenses.edit.title(expenseId),
                tab: "expenses",
                state: expense.state,
                warning: expense.warning,
                form
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            const form = ExpenseForm.initializeFaulted(
                dataStorageError.map<IFormError>({
                    notFound: this._translation.expenses.form.error.notFound(expenseMonth),
                    unknown: this._translation.expenses.form.error.unknown
                }),
                this._translation
            );
            return this.render("expenses/edit-not-found", {
                title: this._translation.expenses.edit.title(expenseId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}