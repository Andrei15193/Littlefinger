import type { Context } from "@azure/functions"
import type { IExpenseEntity, IExpenseShopEntity } from "../app/data/azureStorage/entities/Expenses";
import type { IExpenseShopRenameRequest } from "../app/data/azureStorage/requests/IExpenseShopRenameRequest";
import type { RestError } from "@azure/data-tables";
import { AzureStorage } from "../app/data/azureStorage/AzureStorage";
import { AzureTableStorageUtils } from "../app/data/repositories/AzureTableStorageUtils";
import { DataStorageError } from "../app/data/DataStorageError";

export default async function expenseShopsRenameRequestConsumer(context: Context, { userId, initialExpenseShopName, newExpenseShopName }: IExpenseShopRenameRequest): Promise<void> {
    try {
        context.log(`Expense shop rename requested for user ${userId} having initial name  ${initialExpenseShopName}, new name: ${newExpenseShopName}`)

        const azureStorage = new AzureStorage(process.env.AzureWebJobsStorage as string);

        const initialExpenseShopEntity = await azureStorage.tables.expenseShops.getEntity<IExpenseShopEntity>(
            AzureTableStorageUtils.escapeKeyValue(userId),
            AzureTableStorageUtils.escapeKeyValue(initialExpenseShopName.toLowerCase())
        );
        const destinationExpenseShopEntity = await azureStorage.tables.expenseShops.getEntity<IExpenseShopEntity>(
            AzureTableStorageUtils.escapeKeyValue(userId),
            AzureTableStorageUtils.escapeKeyValue(newExpenseShopName.toLowerCase())
        );

        const warningActivation = new Date(initialExpenseShopEntity.warningActivation!);
        warningActivation.setMinutes(warningActivation.getMinutes() - 5);
        if (warningActivation < new Date())
            context.log(`The time allocated for processing the rename change request for ExpenseShopEntity('${userId}', '${initialExpenseShopName.toLowerCase()}') has elapsed. Skipping.`);
        else {
            for await (const expenseEntity of azureStorage.tables.expenses.listEntities<IExpenseEntity>())
                if (expenseEntity.shop.localeCompare(initialExpenseShopName, "en-GB", { sensitivity: "base" }) === 0)
                    try {
                        await azureStorage.tables.expenses.updateEntity<Pick<IExpenseEntity, "partitionKey" | "rowKey" | "shop">>(
                            {
                                partitionKey: expenseEntity.partitionKey,
                                rowKey: expenseEntity.rowKey,
                                shop: newExpenseShopName
                            },
                            "Merge",
                            { etag: expenseEntity.etag });
                    }
                    catch (error) {
                        const dataStorageError = new DataStorageError(error as RestError);
                        dataStorageError.handle({
                            invalidEtag() {
                                console.warn(`ExpenseEntity('${userId}-${expenseEntity.month}', '${expenseEntity.id}') was updated while changing shop name, skipping.`);
                            },
                            notFound() {
                                console.warn(`ExpenseEntity('${userId}-${expenseEntity.month}', '${expenseEntity.id}') was removed while changing shop name, skipping.`);
                            },
                            unknown() {
                                console.error(`Failed to update ExpenseEntity with unknown error, skipping.`);
                            }
                        })
                    }

            await azureStorage.tables.expenseShops.updateEntity<IExpenseShopEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(newExpenseShopName.toLowerCase()),
                    name: newExpenseShopName,
                    state: "ready"
                },
                "Replace",
                { etag: destinationExpenseShopEntity.etag }
            );
            await azureStorage.tables.expenseShops.deleteEntity(
                AzureTableStorageUtils.escapeKeyValue(userId),
                AzureTableStorageUtils.escapeKeyValue(initialExpenseShopName.toLowerCase()),
                { etag: initialExpenseShopEntity.etag }
            );

            context.log(`The rename change request for ExpenseShopEntity('${userId}', '${initialExpenseShopName}') has been successfully completed.`);
        }
    }
    catch (error) {
        const dataStorageError = new DataStorageError(error as RestError);
        dataStorageError.handle({
            notFound: () => {
                context.log(`The the rename change request for ExpenseShopEntity('${userId}', '${initialExpenseShopName}') was not performed, entity not found.`);
            },
            unknown: () => {
                throw dataStorageError;
            }
        })
    }
}