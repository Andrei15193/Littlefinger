import type { Context } from "@azure/functions"
import type { IExpenseEntity, IExpenseTagEntity } from "../app/data/azureStorage/entities/Expenses";
import type { IExpenseTagRemoveRequest } from "../app/data/azureStorage/requests/IExpenseTagRemoveRequest";
import type { RestError } from "@azure/data-tables";
import { AzureStorage } from "../app/data/azureStorage/AzureStorage";
import { AzureTableStorageUtils } from "../app/data/repositories/AzureTableStorageUtils";
import { DataStorageError } from "../app/data/DataStorageError";

export default async function expenseTagsDeleteRequestConsumer(context: Context, { userId, expenseTagName }: IExpenseTagRemoveRequest): Promise<void> {
    try {
        context.log(`Executing expense tag remove requested for ExpenseTagEntity('${userId}', '${expenseTagName}')`);

        const azureStorage = new AzureStorage(process.env.AzureWebJobsStorage as string);

        const expenseTagEntity = await azureStorage.tables.expenseTags.getEntity<IExpenseTagEntity>(
            AzureTableStorageUtils.escapeKeyValue(userId),
            AzureTableStorageUtils.escapeKeyValue(expenseTagName.toLowerCase())
        );

        const warningActivation = new Date(expenseTagEntity.warningActivation!);
        warningActivation.setMinutes(warningActivation.getMinutes() - 5);
        if (warningActivation < new Date())
            context.log(`The time allocated for processing the remove request for ExpenseTagEntity('${userId}', '${expenseTagName.toLowerCase()}') has elapsed. Skipping.`);
        else {
            for await (const expenseEntity of azureStorage.tables.expenses.listEntities<IExpenseEntity>()) {
                const expenseTagNames: readonly string[] = JSON.parse(expenseEntity.tags);
                if (expenseTagNames.findIndex(expenseTagName => expenseTagName.localeCompare(expenseTagName, "en-GB", { sensitivity: "base" }) === 0) >= 0)
                    try {
                        await azureStorage.tables.expenses.updateEntity<Pick<IExpenseEntity, "partitionKey" | "rowKey" | "tags">>(
                            {
                                partitionKey: expenseEntity.partitionKey,
                                rowKey: expenseEntity.rowKey,
                                tags: JSON.stringify(expenseTagNames.filter(existingExpenseTagName => existingExpenseTagName.localeCompare(expenseTagName, "en-GB", { sensitivity: "base" }) !== 0))
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

            await azureStorage.tables.expenseTags.deleteEntity(
                expenseTagEntity.partitionKey,
                expenseTagEntity.rowKey,
                { etag: expenseTagEntity.etag }
            );

            context.log(`The remove request for ExpenseTagEntity('${userId}', '${expenseTagName}') has been successfully completed.`);
        }
    }
    catch (error) {
        const dataStorageError = new DataStorageError(error as RestError);
        dataStorageError.handle({
            notFound: () => {
                context.log(`The the remove request for ExpenseTagEntity('${userId}', '${expenseTagName}') was not performed, entity not found.`);
            },
            unknown: () => {
                throw dataStorageError;
            }
        })
    }
}