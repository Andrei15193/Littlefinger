import type { RestError, TableEntityResult } from "@azure/data-tables";
import type { IExpenseTag } from "../../../../model/Expenses";
import type { IExpenseTagsRepository } from "../../expenses/IExpenseTagsRepository";
import type { IAzureStorage } from "../../../azureStorage";
import type { IExpenseTagEntity } from "../../../azureStorage/entities/Expenses";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";

export class AzureStorageExpenseTagsRepository implements IExpenseTagsRepository {
    private readonly _userId: string;
    private readonly _azureStorage: IAzureStorage;

    public constructor(userId: string, azureStorage: IAzureStorage) {
        this._userId = userId;
        this._azureStorage = azureStorage;
    }

    public async getAllAsync(): Promise<readonly IExpenseTag[]> {
        try {
            const expenseTags: IExpenseTag[] = [];

            for await (const expenseTagEntity of this._azureStorage.tables.expenseTags.listEntities<IExpenseTagEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                expenseTags.push(this._mapExpenseTagEntity(expenseTagEntity));

            return expenseTags;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async getAllByNameAsync(): Promise<{ readonly [tagName: string]: IExpenseTag; }> {
        try {
            const expenseTagsByName: Record<string, IExpenseTag> = {};

            for await (const expenseTagEntity of this._azureStorage.tables.expenseTags.listEntities<IExpenseTagEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                if (expenseTagsByName[expenseTagEntity.name] === undefined)
                    expenseTagsByName[expenseTagEntity.name] = this._mapExpenseTagEntity(expenseTagEntity);

            return expenseTagsByName;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async addAsync(expenseTag: Omit<IExpenseTag, "etag">): Promise<void> {
        try {
            await this._azureStorage.tables.expenseTags.upsertEntity<IExpenseTagEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(expenseTag.name),
                    name: expenseTag.name,
                    color: expenseTag.color
                },
                "Merge"
            );
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    private _mapExpenseTagEntity(expenseTagEntity: TableEntityResult<IExpenseTagEntity>): IExpenseTag {
        return {
            name: expenseTagEntity.name,
            color: expenseTagEntity.color,
            etag: expenseTagEntity.etag
        };
    }
}