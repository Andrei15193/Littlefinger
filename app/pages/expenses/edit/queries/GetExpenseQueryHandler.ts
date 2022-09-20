import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { QueryHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class GetExpenseQueryHandler extends QueryHandler<IEditExpenseRouteParams, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expensesRepository, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeQueryAsync({ month: expenseMonth, id: expenseId }: IEditExpenseRouteParams, queryParmas: {}): Promise<IRequestResult> {
        try {
            const expenseEntity = await this._expensesRepository.getAsync({ month: expenseMonth, id: expenseId });
            const form = await ExpenseForm.initializeAsync(
                {
                    validated: "false",
                    etag: expenseEntity.etag,

                    name: expenseEntity.name,
                    shop: expenseEntity.shop,
                    tags: expenseEntity.tags.map(tag => tag.name),
                    price: expenseEntity.price,
                    currency: expenseEntity.currency,
                    quantity: expenseEntity.quantity,
                    date: expenseEntity.date.toISOString()
                },
                this._translation,
                this._expenseTagsRepository
            );

            return this.render("expenses/edit", {
                title: this._translation.expenses.edit.title(expenseId),
                tab: "expenses",
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
                form
            });
        }
    }
}