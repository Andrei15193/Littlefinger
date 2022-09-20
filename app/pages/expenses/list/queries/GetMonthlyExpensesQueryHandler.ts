import type { IListExpensesRouteParams, IListExpensesViewOptions, ITotal } from "../ListExpensesPageDefinition";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/translation";
import type { IRequestResult } from "../../../page/results";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import { QueryHandler } from "../../../page";
import { AzureTableStorageUtils } from "../../../../data/repositories/AzureTableStorageUtils";

export class GetMonthlyExpensesQueryHandler extends QueryHandler<IListExpensesRouteParams, IListExpensesViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ translation, expensesRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expensesRepository = expensesRepository;
    }

    public async executeQueryAsync({ month: expensesMonth = AzureTableStorageUtils.getExpenseMonth(new Date()) }: IListExpensesRouteParams, queryParmas: {}): Promise<IRequestResult> {
        const expenses = await this._expensesRepository.getAllAsync(expensesMonth);
        const totals: readonly ITotal[] = expenses
            .reduce<{ readonly currency: ITotal["currency"], amount: ITotal["amount"] }[]>(
                (result, expense) => {
                    const total = result.find(total => total.currency === expense.currency);
                    if (total !== undefined)
                        total.amount = (total.amount * 100 + expense.amount * 100) / 100;
                    else
                        result.push({
                            currency: expense.currency,
                            amount: expense.amount
                        });
                    return result;
                },
                []
            )
            .sort((left, right) => right.amount - left.amount);

        return this.render("expenses/list", {
            title: this._translation.expenses.list.title,
            tab: "expenses",
            expenses,
            totals,
            format: {
                integerDigitsCount: {
                    price: Math.max(...expenses.map(expense => expense.price))?.toFixed(0).length,
                    quantity: Math.max(...expenses.map(expense => expense.quantity))?.toFixed(0).length,
                    amount: totals[0]?.amount.toFixed(0).length
                }
            },
            pagination: {
                nextMonth: GetMonthlyExpensesQueryHandler._setUtcNextMonth(new Date(expensesMonth)).toISOString().substring(0, "YYYY-MM".length),
                currentMonth: expensesMonth,
                previousMonth: GetMonthlyExpensesQueryHandler._setUtcPreviousMonth(new Date(expensesMonth)).toISOString().substring(0, "YYYY-MM".length)
            }
        });
    }

    private static _setUtcNextMonth(date: Date): Date {
        if (date.getUTCMonth() == 12) {
            date.setUTCFullYear(date.getUTCFullYear() + 1);
            date.setUTCMonth(1);
        }
        else
            date.setUTCMonth(date.getUTCMonth() + 1);

        return date;
    }

    private static _setUtcPreviousMonth(date: Date): Date {
        if (date.getUTCMonth() == 1) {
            date.setUTCFullYear(date.getUTCFullYear() - 1);
            date.setUTCMonth(12);
        }
        else
            date.setUTCMonth(date.getUTCMonth() - 1);

        return date;
    }
}