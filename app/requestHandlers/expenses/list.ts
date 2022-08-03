import type { Express } from "express";
import type { IExpenseEntity } from "../../data/IExpenseEntity";
import { tables } from "../../table-storage";
import { tabs } from "../../tabs";

interface IExpense {
    readonly id: string;
    readonly name: string;
    readonly shop: string;
    readonly tags: readonly string[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly amount: number;
    readonly date: Date;
}

interface ITotal {
    readonly currency: string;
    amount: number;
}

const title = "Expenses";
const tab = tabs.expenses;

export function registerHandlers(app: Express): void {
    app.get("/expenses/:month(\\d{4}-\\d{2})?", async (req, res) => {
        const { params: { month: routeMonth, month: expensesMonth = new Date().toISOString().substring(0, "YYYY-MM".length) } } = req;
        const { locals: { user: { id: userId } } } = res;

        const monthlyExpenses = tables.expenses.listEntities<IExpenseEntity>({
            queryOptions: {
                filter: `PartitionKey eq '${userId}-${expensesMonth}'`
            }
        });
        const expenseEntities: IExpenseEntity[] = [];
        for await (const expenseEntity of monthlyExpenses)
            expenseEntities.push(expenseEntity);

        const expenses: IExpense[] = expenseEntities
            .sort((left, right) => {
                const compareResult = left.date.getDate() - right.date.getDate();
                return compareResult == 0 ? left.name.localeCompare(right.name) : compareResult;
            })
            .map(expenseEntity => ({
                id: expenseEntity.rowKey,
                name: expenseEntity.name,
                shop: expenseEntity.shop,
                tags: JSON.parse(expenseEntity.tags),
                price: expenseEntity.price,
                currency: expenseEntity.currency,
                quantity: expenseEntity.quantity,
                amount: expenseEntity.price * 100 * expenseEntity.quantity / 100,
                date: expenseEntity.date
            }));

        const totals: readonly Readonly<ITotal>[] = expenses
            .reduce<ITotal[]>(
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

        res.render("expenses/list", {
            title,
            tab,
            expenses,
            totals,
            route: {
                month: routeMonth
            },
            format: {
                integerDigitsCount: {
                    price: Math.max(...expenses.map(expense => expense.price))?.toFixed(0).length,
                    quantity: Math.max(...expenses.map(expense => expense.quantity))?.toFixed(0).length,
                    amount: totals[0]?.amount.toFixed(0).length
                }
            },
            pagination: {
                nextMonth: setUtcNextMonth(new Date(expensesMonth)).toISOString().substring(0, "YYYY-MM".length),
                currentMonth: expensesMonth,
                previousMonth: setUtcPreviousMonth(new Date(expensesMonth)).toISOString().substring(0, "YYYY-MM".length)
            }
        });
    });
}

function setUtcNextMonth(date: Date): Date {
    if (date.getUTCMonth() == 12) {
        date.setUTCFullYear(date.getUTCFullYear() + 1);
        date.setUTCMonth(1);
    }
    else
        date.setUTCMonth(date.getUTCMonth() + 1);

    return date;
}

function setUtcPreviousMonth(date: Date): Date {
    if (date.getUTCMonth() == 1) {
        date.setUTCFullYear(date.getUTCFullYear() - 1);
        date.setUTCMonth(12);
    }
    else
        date.setUTCMonth(date.getUTCMonth() - 1);

    return date;
}