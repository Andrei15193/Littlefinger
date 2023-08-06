import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { ICopyExpenseRouteParams } from "../CopyExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { FormQueryHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class GetExpenseQueryHandler extends FormQueryHandler<ExpenseForm, ICopyExpenseRouteParams, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ translation, expensesRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
    }

    public async executeQueryAsync(form: ExpenseForm, { month: expenseMonth, id: expenseId }: ICopyExpenseRouteParams): Promise<IRequestResult> {
        try {
            const expense = await this._expensesRepository.getAsync({ month: expenseMonth, id: expenseId });

            form.name.value = expense.name;
            form.shop.value = expense.shop;
            form.tags.value = expense.tags.map(tag => tag.name);
            form.price.value = expense.price;
            form.currency.value = expense.currency;
            form.quantity.value = expense.quantity;
            form.date.value = expense.date;

            form.etag = expense.etag;

            return this.render("expenses/copy", {
                title: this._translation.expenses.copy.title(expenseId),
                tab: "expenses",
                state: expense.state,
                warning: expense.warning,
                form
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            form.error = dataStorageError.map<IFormError>({
                notFound: this._translation.expenses.form.error.notFound(expenseMonth),
                unknown: this._translation.expenses.form.error.unknown
            });
            return this.render("expenses/edit-not-found", {
                title: this._translation.expenses.copy.title(expenseId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}