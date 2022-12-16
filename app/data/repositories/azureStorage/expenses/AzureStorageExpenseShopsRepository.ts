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

    public async getAllAsync(): Promise<readonly IExpenseShop[]> {
        try {
            const expenseShops: IExpenseShop[] = [];

            for await (const expenseTagEntity of this._azureStorage.tables.expenseShops.listEntities<IExpenseShopEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                expenseShops.push(this._mapExpenseShopEntity(expenseTagEntity));

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

    private _mapExpenseShopEntity(expenseShopEntity: TableEntityResult<IExpenseShopEntity>): IExpenseShop {
        return {
            name: expenseShopEntity.name,
            etag: expenseShopEntity.etag
        };
    }
}