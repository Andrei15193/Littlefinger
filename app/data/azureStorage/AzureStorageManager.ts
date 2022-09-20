import type { AzureStorage } from "./AzureStorage";

export class AzureStorageManager {
    private readonly _azureStorage: AzureStorage;

    public constructor(azureStorage: AzureStorage) {
        this._azureStorage = azureStorage;
    }

    public async ensureTableStorageAsync({ recreateTables = false, deleteExtraTables = false }: IEnsureTableStorageOptions = {}): Promise<void> {
        if (recreateTables) {
            const tableNames: readonly string[] = await this._getTableNamesAsync();
            await Promise.all(tableNames.map(tableName => this._azureStorage.tables.tableService.deleteTable(tableName)));
        }
        else if (deleteExtraTables) {
            const tableNames: readonly string[] = await this._getTableNamesAsync();
            await Promise.all(tableNames
                .filter(tableName => this._azureStorage.tables.every(table => table.tableName !== tableName))
                .map(tableName => this._azureStorage.tables.tableService.deleteTable(tableName))
            );
        }

        await Promise.all(this._azureStorage.tables.map(table => table.createTable()));
    }

    private async _getTableNamesAsync(): Promise<readonly string[]> {
        const tableNames: string[] = [];

        for await (let table of this._azureStorage.tables.tableService.listTables())
            if (table.name !== undefined)
                tableNames.push(table.name);

        return tableNames;
    }
}

export interface IEnsureTableStorageOptions {
    readonly recreateTables?: boolean;
    readonly deleteExtraTables?: boolean;
}