import type { RestError } from "@azure/data-tables";
import type { IAzureStorage } from "../../../azureStorage/index";
import type { ICurrenciesRepository } from "../../expenses/ICurrenciesRepository";
import type { ICurrencyEntity } from "../../../azureStorage/entities/Currencies";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";

export class AzureStorageCurrenciesRepository implements ICurrenciesRepository {
    private readonly _userId: string;
    private readonly _azureStorage: IAzureStorage;

    public constructor(userId: string, azureStorage: IAzureStorage) {
        this._userId = userId;
        this._azureStorage = azureStorage;
    }

    public async getAllAsync(): Promise<readonly string[]> {
        try {
            const currencies: string[] = [];

            for await (const expenseTagEntity of this._azureStorage.tables.currencies.listEntities<ICurrencyEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                currencies.push(expenseTagEntity.displayValue);

            return currencies;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }
}