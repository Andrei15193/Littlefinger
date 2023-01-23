import type { IListExpensesRouteParams, IListExpensesQueryParams, IListExpensesViewOptions, ICurrencyTotal, ITagTotal, ITagDistribution } from "../ListExpensesPageDefinition";
import type { IUser } from "../../../../model/Users";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results";
import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import { BasicQueryHandler } from "../../../page";
import { ExpensesUtils } from "../../../../model/ExpensesUtils";

export class GetMonthlyExpensesQueryHandler extends BasicQueryHandler<IListExpensesRouteParams, IListExpensesViewOptions, IListExpensesQueryParams> {
    private readonly _user: IUser;
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;

    public constructor({ user, translation, expensesRepository }: IDependencyContainer) {
        super();

        this._user = user!;
        this._translation = translation;
        this._expensesRepository = expensesRepository;
    }

    public async executeQueryAsync({ month: expensesMonth = ExpensesUtils.getExpenseMonth(new Date()) }: IListExpensesRouteParams, { currency }: IListExpensesQueryParams): Promise<IRequestResult> {
        const expenses = [...await this._expensesRepository.getAllAsync(expensesMonth)].sort(
            (left, right) => {
                const leftExpenseDate = new Date(left.date.getUTCFullYear(), left.date.getUTCMonth(), left.date.getUTCDate());
                const rightExpenseDate = new Date(right.date.getUTCFullYear(), right.date.getUTCMonth(), right.date.getUTCDate());
                return leftExpenseDate < rightExpenseDate
                    ? -1
                    : leftExpenseDate > rightExpenseDate
                        ? 1
                        : left.name.localeCompare(right.name, this._translation.locale)
            }
        );

        const totals: readonly ICurrencyTotal[] = expenses
            .reduce<{ readonly currency: ICurrencyTotal["currency"], amount: ICurrencyTotal["amount"] }[]>(
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

        const selectedCurrency = currency?.toLocaleUpperCase(this._translation.locale) || (totals.findIndex(total => total.currency === this._user.defaultCurrency) > -1 ? this._user.defaultCurrency : totals[0]?.currency);
        const totalsByTags: readonly ITagTotal[] = expenses
            .reduce<{ readonly tag: ITagTotal["tag"], amount: ITagTotal["amount"] }[]>(
                (result, expense) => {
                    if (expense.currency === selectedCurrency)
                        if (expense.tags.length === 0) {
                            const total = result.find(total => total.tag === null);
                            if (total !== undefined)
                                total.amount += expense.amount;
                            else
                                result.push({ tag: null, amount: expense.amount });
                        }
                        else
                            expense.tags.forEach(expenseTag => {
                                const total = result.find(total => total.tag === expenseTag);
                                if (total !== undefined)
                                    total.amount = (total.amount * 100 + expense.amount * 100) / 100;
                                else
                                    result.push({ tag: expenseTag, amount: expense.amount });
                            });
                    return result;
                },
                []
            )
            .sort((left, right) => left.tag === null ? 1 : right.tag === null ? -1 : left.tag.name.localeCompare(right.tag.name, this._translation.locale));
        const distributionTotalAmount = totalsByTags.reduce((result, total) => result + total.amount, 0);
        const distributionsByTags: readonly ITagDistribution[] = totalsByTags
            .reduce<ITagDistribution[]>(
                (result, total) => {
                    result.push({
                        tag: total.tag,
                        amount: total.amount,
                        percentage: Math.floor(10000 * total.amount / distributionTotalAmount) / 100
                    })
                    return result;
                },
                []
            )
            .sort((left, right) => left.tag === null ? -1 : right.tag === null ? 1 : 0);

        return this.render("expenses/list", {
            title: this._translation.expenses.list.title,
            tab: "expenses",
            expenses,
            totals,
            currencyTagDistirbutions: distributionsByTags,
            filters: {
                currency: selectedCurrency
            },
            format: {
                integerDigitsCount: {
                    price: Math.max(...expenses.map(expense => expense.price))?.toFixed(0).length,
                    quantity: Math.max(...expenses.map(expense => expense.quantity))?.toFixed(0).length,
                    amount: totals[0]?.amount.toFixed(0).length
                }
            },
            pagination: {
                currentDateMonth: ExpensesUtils.getExpenseMonth(new Date()),
                nextMonth: ExpensesUtils.getExpenseMonth(GetMonthlyExpensesQueryHandler._setUtcNextMonth(new Date(expensesMonth))),
                currentMonth: expensesMonth,
                previousMonth: ExpensesUtils.getExpenseMonth(GetMonthlyExpensesQueryHandler._setUtcPreviousMonth(new Date(expensesMonth)))
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