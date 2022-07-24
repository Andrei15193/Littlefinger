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
    readonly date: string;
}

export function registerHandlers(app: Express): void {
    app.get("/expenses", async (req, res) => {
        const { user: { id: userId } } = res.locals;

        const monthlyExpenses = tables.expenses.listEntities<IExpenseEntity>({
            queryOptions: {
                filter: `PartitionKey eq '${userId}-2022-07'`
            }
        });
        const expenseEntities: IExpenseEntity[] = [];
        for await (const expenseEntity of monthlyExpenses)
            expenseEntities.push(expenseEntity);

        const expenses: IExpense[] = expenseEntities
            .sort((left, right) => left.date.getDate() - right.date.getDate())
            .map(expenseEntity => ({
                id: expenseEntity.rowKey,
                name: expenseEntity.name,
                shop: expenseEntity.shop,
                tags: JSON.parse(expenseEntity.tags),
                price: expenseEntity.price,
                currency: expenseEntity.currency,
                quantity: expenseEntity.quantity,
                amount: expenseEntity.price * 100 * expenseEntity.quantity / 100,
                date: expenseEntity.date.toLocaleDateString()
            }));

        res.render("expenses/index", { title: "Expenses", tab: tabs.expenses, expenses });
    });
}