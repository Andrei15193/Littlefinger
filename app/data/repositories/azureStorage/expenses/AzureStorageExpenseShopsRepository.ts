import type { RestError, TableEntityResult } from "@azure/data-tables";
import type { IExpenseShop, IExpenseShopWarning } from "../../../../model/Expenses";
import type { IExpenseShopEntity } from "../../../azureStorage/entities/Expenses";
import type { IAzureStorage } from "../../../azureStorage/index";
import type { IExpenseShopsRepository } from "../../expenses/IExpenseShopsRepository";
import type { IExpenseShopRenameRequest } from "../../../azureStorage/requests/IExpenseShopRenameRequest";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";
import { AzureQueueStorageUtils } from "../../AzureQueueStorageUtils";

export class AzureStorageExpenseShopsRepository implements IExpenseShopsRepository {
    private readonly _userId: string;
    private readonly _azureStorage: IAzureStorage;

    public constructor(userId: string, azureStorage: IAzureStorage) {
        this._userId = userId;
        this._azureStorage = azureStorage;
    }

    public async getByNameAsync(shopName: string): Promise<IExpenseShop> {
        if (shopName === undefined || shopName === null)
            throw new DataStorageError("NotFound");

        try {
            let expenseShopEntity = await this._azureStorage.tables.expenseShops.getEntity<IExpenseShopEntity>(
                AzureTableStorageUtils.escapeKeyValue(this._userId),
                AzureTableStorageUtils.escapeKeyValue(shopName.toLowerCase())
            );
            const expenseShop = this._mapExpenseShopEntity(expenseShopEntity);

            return expenseShop;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async getAllAsync(): Promise<readonly IExpenseShop[]> {
        try {
            const expenseShops: IExpenseShop[] = [];

            for await (const expenseShopEntity of this._azureStorage.tables.expenseShops.listEntities<IExpenseShopEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                expenseShops.push(this._mapExpenseShopEntity(expenseShopEntity));

            expenseShops.sort((left, right) => left.name.localeCompare(right.name, "en-GB", { sensitivity: "base" }));

            return expenseShops;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async renameAsync(initialExpenseShopName: string, initialExpenseShopEtag: string, newExpenseShopName: string): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(initialExpenseShopEtag))
            throw new DataStorageError("InvalidEtag");

        if (initialExpenseShopName !== newExpenseShopName) {
            const warningActivation = new Date();
            warningActivation.setHours(warningActivation.getHours() + 1);

            try {
                if (initialExpenseShopName.localeCompare(newExpenseShopName, "en-GB", { sensitivity: "base" }) !== 0)
                    await this._ensureDestinationExpenseShopAsync(initialExpenseShopName, newExpenseShopName, warningActivation);

                await this._azureStorage.tables.expenseShops.updateEntity<Omit<IExpenseShopEntity, "name">>(
                    {
                        partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                        rowKey: AzureTableStorageUtils.escapeKeyValue(initialExpenseShopName.toLowerCase()),
                        state: "renaming",
                        warning: JSON.stringify({
                            key: "rename",
                            arguments: [newExpenseShopName]
                        } as IExpenseShopWarning),
                        warningActivation
                    },
                    "Merge",
                    { etag: initialExpenseShopEtag }
                );

                await this._azureStorage.queues.expenseShopRenameRequests.sendMessage(AzureQueueStorageUtils.encodeMessage<IExpenseShopRenameRequest>({
                    userId: this._userId,
                    initialExpenseShopName,
                    newExpenseShopName
                }));
            }
            catch (error) {
                if (error instanceof DataStorageError)
                    throw error;

                throw new DataStorageError(error as RestError);
            }
        }
    }

    public async removeAsync(expenseShopName: string, etag: string): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(etag))
            throw new DataStorageError("InvalidEtag");

        try {
            await this._azureStorage.tables.expenseShops.deleteEntity(
                AzureTableStorageUtils.escapeKeyValue(this._userId),
                AzureTableStorageUtils.escapeKeyValue(expenseShopName.toLowerCase()),
                { etag });
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    private _mapExpenseShopEntity(expenseShopEntity: TableEntityResult<IExpenseShopEntity>): IExpenseShop {
        let warning: IExpenseShopWarning | undefined =
            expenseShopEntity.warning !== undefined && expenseShopEntity.warning !== null && expenseShopEntity.warningActivation !== undefined && expenseShopEntity.warningActivation !== null
                && expenseShopEntity.warningActivation < new Date()
                ? JSON.parse(expenseShopEntity.warning)
                : undefined;

        return {
            name: expenseShopEntity.name,
            warning,
            state: warning === undefined ? expenseShopEntity.state : "ready",
            etag: expenseShopEntity.etag
        };
    }

    private async _ensureDestinationExpenseShopAsync(initialExpenseShopName: string, expenseShopName: string, warningActivation: Date): Promise<void> {
        let destinationExpenseShopEntity: TableEntityResult<IExpenseShopEntity> | null = null;
        try {
            destinationExpenseShopEntity = await this._azureStorage.tables.expenseShops.getEntity<IExpenseShopEntity>(AzureTableStorageUtils.escapeKeyValue(this._userId), AzureTableStorageUtils.escapeKeyValue(expenseShopName.toLowerCase()));
        }
        catch (error) {
            const dataStorageError = new DataStorageError(error as RestError);
            if (dataStorageError.reason !== "NotFound")
                throw dataStorageError;
        }

        if (destinationExpenseShopEntity === null)
            await this._azureStorage.tables.expenseShops.createEntity<IExpenseShopEntity>({
                partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                rowKey: AzureTableStorageUtils.escapeKeyValue(expenseShopName.toLowerCase()),
                name: expenseShopName,
                state: "renaming",
                warning: JSON.stringify({
                    key: "renameTarget",
                    arguments: [initialExpenseShopName]
                } as IExpenseShopWarning),
                warningActivation
            });
        else {
            if (destinationExpenseShopEntity.state !== "ready" && !AzureTableStorageUtils.hasWarning(destinationExpenseShopEntity))
                throw new DataStorageError("TargetNotReady");

            await this._azureStorage.tables.expenseShops.updateEntity<Omit<IExpenseShopEntity, "name">>(
                {
                    partitionKey: destinationExpenseShopEntity.partitionKey,
                    rowKey: destinationExpenseShopEntity.rowKey,
                    state: "renaming",
                    warning: JSON.stringify({
                        key: "renameTarget",
                        arguments: [initialExpenseShopName]
                    } as IExpenseShopWarning),
                    warningActivation
                },
                "Merge",
                { etag: destinationExpenseShopEntity.etag }
            );
        }
    }
}