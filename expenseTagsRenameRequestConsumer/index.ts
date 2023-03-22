import type { Context } from "@azure/functions"
import type { IExpenseEntity, IExpenseTagEntity } from "../app/data/azureStorage/entities/Expenses";
import type { IExpenseTagRenameRequest } from "../app/data/azureStorage/requests/IExpenseTagRenameRequest";
import type { RestError } from "@azure/data-tables";
import { AzureStorage } from "../app/data/azureStorage/AzureStorage";
import { AzureTableStorageUtils } from "../app/data/repositories/AzureTableStorageUtils";
import { DataStorageError } from "../app/data/DataStorageError";

export default async function expenseTagsRenameRequestConsumer(context: Context, { userId, initialExpenseTagName, newExpenseTagName }: IExpenseTagRenameRequest): Promise<void> {
    try {
        context.log(`Expense tag rename requested for user ${userId} having initial name '${initialExpenseTagName}', new name: '${newExpenseTagName}'`)

        const azureStorage = new AzureStorage(process.env.AzureWebJobsStorage as string);

        const initialExpenseTagEntity = await azureStorage.tables.expenseTags.getEntity<IExpenseTagEntity>(
            AzureTableStorageUtils.escapeKeyValue(userId),
            AzureTableStorageUtils.escapeKeyValue(initialExpenseTagName.toLowerCase())
        );
        const destinationExpenseTagEntity = await azureStorage.tables.expenseTags.getEntity<IExpenseTagEntity>(
            AzureTableStorageUtils.escapeKeyValue(userId),
            AzureTableStorageUtils.escapeKeyValue(newExpenseTagName.toLowerCase())
        );

        const warningActivation = new Date(initialExpenseTagEntity.warningActivation!);
        warningActivation.setMinutes(warningActivation.getMinutes() - 5);
        if (warningActivation < new Date())
            context.log(`The time allocated for processing the rename change request for ExpenseTagEntity('${userId}', '${initialExpenseTagName.toLowerCase()}') has elapsed. Skipping.`);
        else {
            for await (const expenseEntity of azureStorage.tables.expenses.listEntities<IExpenseEntity>()) {
                const expenseTagNames: readonly string[] = JSON.parse(expenseEntity.tags);
                if (expenseTagNames.findIndex(expenseTagName => expenseTagName.localeCompare(initialExpenseTagName, "en-GB", { sensitivity: "base" }) === 0) >= 0)
                    try {
                        await azureStorage.tables.expenses.updateEntity<Pick<IExpenseEntity, "partitionKey" | "rowKey" | "tags">>(
                            {
                                partitionKey: expenseEntity.partitionKey,
                                rowKey: expenseEntity.rowKey,
                                tags: JSON.stringify(expenseTagNames.map(expenseTagName =>
                                    expenseTagName.localeCompare(initialExpenseTagName, "en-GB", { sensitivity: "base" }) === 0
                                        ? newExpenseTagName
                                        : expenseTagName
                                ))
                            },
                            "Merge",
                            { etag: expenseEntity.etag });
                    }
                    catch (error) {
                        const dataStorageError = new DataStorageError(error as RestError);
                        dataStorageError.handle({
                            invalidEtag() {
                                console.warn(`ExpenseEntity('${userId}-${expenseEntity.month}', '${expenseEntity.id}') was updated while changing tag name, skipping.`);
                            },
                            notFound() {
                                console.warn(`ExpenseEntity('${userId}-${expenseEntity.month}', '${expenseEntity.id}') was removed while changing tag name, skipping.`);
                            },
                            unknown() {
                                console.error(`Failed to update ExpenseEntity with unknown error, skipping.`);
                            }
                        })
                    }
            }

            await azureStorage.tables.expenseTags.updateEntity<IExpenseTagEntity>(
                {
                    partitionKey: destinationExpenseTagEntity.partitionKey,
                    rowKey: destinationExpenseTagEntity.rowKey,
                    name: destinationExpenseTagEntity.name,
                    color: destinationExpenseTagEntity.color,
                    state: "ready"
                },
                "Replace",
                { etag: destinationExpenseTagEntity.etag }
            );
            if (initialExpenseTagName.localeCompare(newExpenseTagName, "en-GB", { sensitivity: "base" }) !== 0)
                await azureStorage.tables.expenseTags.deleteEntity(
                    initialExpenseTagEntity.partitionKey,
                    initialExpenseTagEntity.rowKey,
                    { etag: initialExpenseTagEntity.etag }
                );

            context.log(`The rename change request for ExpenseTagEntity('${userId}', '${initialExpenseTagName}') has been successfully completed.`);
        }
    }
    catch (error) {
        const dataStorageError = new DataStorageError(error as RestError);
        dataStorageError.handle({
            notFound: () => {
                context.log(`The the rename change request for ExpenseTagEntity('${userId}', '${initialExpenseTagName}') was not performed, entity not found.`);
            },
            unknown: () => {
                throw dataStorageError;
            }
        })
    }
}