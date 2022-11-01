import type { Context } from "@azure/functions"
import type { IExpenseEntity } from "../app/data/azureStorage/Entities/Expenses";
import type { IExpenseMonthChangeRequest } from "../app/data/azureStorage/Requests/IExpenseMonthChangeRequest";
import { ExpensesUtils } from "../app/model/ExpensesUtils";
import { AzureStorage } from "../app/data/azureStorage/AzureStorage";
import { AzureTableStorageUtils } from "../app/data/repositories/AzureTableStorageUtils";
import { DataStorageError } from "../app/data/DataStorageError";
import { RestError } from "@azure/data-tables";

export default async function expensesMonthChangeRequestConsumer(context: Context, { userId, expenseKey: { month: expenseMonth, id: expenseId }, newExpenseDateString }: IExpenseMonthChangeRequest): Promise<void> {
    try {
        context.log(`Expense month change requested for user ${userId} having expense ID ${expenseId}, current expense month: ${expenseMonth}, new expense date: ${newExpenseDateString}`)

        const azureStorage = new AzureStorage(process.env.AzureWebJobsStorage as string);

        const expenseEntity = await azureStorage.tables.expenses.getEntity<IExpenseEntity>(
            AzureTableStorageUtils.escapeKeyValue(`${userId}-${expenseMonth}`),
            AzureTableStorageUtils.escapeKeyValue(expenseId)
        );

        const warningActivation = new Date(expenseEntity.warningActivation!);
        warningActivation.setMinutes(warningActivation.getMinutes() - 5);
        if (warningActivation < new Date())
        context.log(`The time allocated for processing the month change request for ExpenseEntity('${userId}-${expenseMonth}', '${expenseId}') has elapsed. Skipping.`);
        else {
            const newExpenseDate = new Date(newExpenseDateString);
            const newExpenseMonth = ExpensesUtils.getExpenseMonth(newExpenseDate);

            await azureStorage.tables.expenses.createEntity<IExpenseEntity>({
                partitionKey: AzureTableStorageUtils.escapeKeyValue(`${userId}-${newExpenseMonth}`),
                rowKey: expenseEntity.rowKey,
                month: newExpenseMonth,
                id: expenseEntity.id,
                name: expenseEntity.name,
                shop: expenseEntity.shop,
                tags: expenseEntity.tags,
                currency: expenseEntity.currency,
                price: expenseEntity.price,
                quantity: expenseEntity.quantity,
                date: newExpenseDate,

                state: "ready"
            });
            await azureStorage.tables.expenses.deleteEntity(expenseEntity.partitionKey, expenseEntity.rowKey, { etag: expenseEntity.etag });

            context.log(`The month change request for ExpenseEntity('${userId}-${expenseMonth}', '${expenseId}') has been successfully completed.`);
        }
    }
    catch (error) {
        const dataStorageError = new DataStorageError(error as RestError);
        dataStorageError.handle({
            notFound: () => {
                context.log(`The the month change request for ExpenseEntity('${userId}-${expenseMonth}', '${expenseId}') was not performed, entity not found.`);
            },
            unknown: () => {
                throw dataStorageError;
            }
        })
    }
}