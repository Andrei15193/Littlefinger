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

    public async renameAsync(initialExpenseShopName: string, newExpenseShopName: string, etag: string): Promise<void> {
        const warningActivation = new Date();
        warningActivation.setHours(warningActivation.getHours() + 1);

        let initialExpenseEtag = etag;
        try {
            const existingDestinationExpenseShop = await this._azureStorage.tables.expenseShops.getEntity<IExpenseShopEntity>(
                AzureTableStorageUtils.escapeKeyValue(this._userId),
                AzureTableStorageUtils.escapeKeyValue(newExpenseShopName.toLowerCase())
            );

            const existingDestinationExpenseShopState = existingDestinationExpenseShop.state === null || existingDestinationExpenseShop.state === undefined
                ? "ready"
                : existingDestinationExpenseShop.state;
            const hasWarning = (existingDestinationExpenseShop.warning !== null && existingDestinationExpenseShop.warning !== undefined
                    && existingDestinationExpenseShop.warningActivation !== null && existingDestinationExpenseShop.warningActivation !== undefined
                    && existingDestinationExpenseShop.warningActivation < new Date());

            if (existingDestinationExpenseShopState !== "ready" && !hasWarning)
                throw new DataStorageError("TargetNorReady");

            const { etag: updatedEtag } = await this._azureStorage.tables.expenseShops.updateEntity<Omit<IExpenseShopEntity, "name">>(
                {
                    partitionKey: existingDestinationExpenseShop.partitionKey,
                    rowKey: existingDestinationExpenseShop.rowKey,
                    state: "renaming",
                    warning: JSON.stringify({
                        key: "renameTarget",
                        arguments: [initialExpenseShopName]
                    } as IExpenseShopWarning),
                    warningActivation
                },
                "Merge",
                { etag: existingDestinationExpenseShop.etag }
            );

            if (initialExpenseShopName.localeCompare(newExpenseShopName, "en-GB", { sensitivity: "base" }) === 0)
                initialExpenseEtag = updatedEtag!;
        }
        catch (error) {
            if (error instanceof DataStorageError)
                throw error;

            const dataStorageError = new DataStorageError(error as RestError);
            await dataStorageError
                .map({
                    async notFound(this: AzureStorageExpenseShopsRepository) {
                        await this._azureStorage.tables.expenseShops.createEntity<IExpenseShopEntity>(
                            {
                                partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                                rowKey: AzureTableStorageUtils.escapeKeyValue(newExpenseShopName.toLowerCase()),
                                name: newExpenseShopName,
                                state: "renaming",
                                warning: JSON.stringify({
                                    key: "renameTarget",
                                    arguments: [initialExpenseShopName]
                                } as IExpenseShopWarning),
                                warningActivation
                            }
                        );
                    },
                    async unknown() {
                        throw error;
                    }
                })
                .call(this);
        }

        try {
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
                { etag: initialExpenseEtag }
            );
            await this._azureStorage.queues.expenseShopRenameRequests.sendMessage(AzureQueueStorageUtils.encodeMessage<IExpenseShopRenameRequest>({
                userId: this._userId,
                initialExpenseShopName,
                newExpenseShopName
            }));
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
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
            etag: expenseShopEntity.etag,
            warning,
            state: warning === undefined ? (expenseShopEntity.state || "ready") : "ready"
        };
    }
}