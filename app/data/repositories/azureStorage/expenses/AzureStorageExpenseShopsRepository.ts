import type { RestError, TableEntityResult } from "@azure/data-tables";
import type { IExpenseShop } from "../../../../model/Expenses";
import type { IExpenseShopEntity } from "../../../azureStorage/entities/Expenses";
import type { IAzureStorage } from "../../../azureStorage/index";
import type { IExpenseShopsRepository } from "../../expenses/IExpenseShopsRepository";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";

export class AzureStorageExpenseShopsRepository implements IExpenseShopsRepository {
    private readonly _userId: string;
    private readonly _azureStorage: IAzureStorage;

    public constructor(userId: string, azureStorage: IAzureStorage) {
        this._userId = userId;
        this._azureStorage = azureStorage;
    }

    public async getByNameAsync(shopName: string): Promise<IExpenseShop | null> {
        if (shopName === undefined || shopName === null)
            return null;

        try {
            let expenseShopEntity = await this._azureStorage.tables.expenseShops.getEntity<IExpenseShopEntity>(AzureTableStorageUtils.escapeKeyValue(this._userId), AzureTableStorageUtils.escapeKeyValue(shopName));
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

            return expenseShops;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async addAsync(expenseShop: Omit<IExpenseShop, "etag">): Promise<void> {
        try {
            await this._azureStorage.tables.expenseShops.upsertEntity<IExpenseShopEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(expenseShop.name),
                    name: expenseShop.name
                },
                "Merge"
            );
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async removeAsync(expenseShopName: string, etag: string): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(etag))
            throw new DataStorageError("InvalidEtag");

        try {
            await this._azureStorage.tables.expenseShops.deleteEntity(AzureTableStorageUtils.escapeKeyValue(this._userId), AzureTableStorageUtils.escapeKeyValue(expenseShopName), { etag });
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    private _mapExpenseShopEntity(expenseShopEntity: TableEntityResult<IExpenseShopEntity>): IExpenseShop {
        return {
            name: expenseShopEntity.name,
            etag: expenseShopEntity.etag
        };
    }
}