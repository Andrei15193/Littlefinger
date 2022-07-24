import { TableClient, TableServiceClient } from "@azure/data-tables";

const AzureTableStorageConnectionString = (process.env as any).CUSTOMCONNSTR_AZURE_STORAGE;

const applicationTables = {
    users: TableClient.fromConnectionString(AzureTableStorageConnectionString, "users"),
    expenses: TableClient.fromConnectionString(AzureTableStorageConnectionString, "expenses"),
};

export const tables = applicationTables as { readonly [key in keyof typeof applicationTables]: TableClient };

export interface IEnsureTableStorageOptions {
    readonly recreateTables?: boolean;
    readonly deleteExtraTables?: boolean;
}

export async function ensureTableStorageAsync({ recreateTables = false, deleteExtraTables = false }: IEnsureTableStorageOptions = {}): Promise<void> {
    const currentTables: readonly TableClient[] = Object.getOwnPropertyNames(applicationTables).reduce(
        (result: TableClient[], key) => {
            const tableClient = (applicationTables as Record<string, any>)[key];
            if (tableClient instanceof TableClient)
                result.push(tableClient);
            return result;
        },
        []
    );

    if (recreateTables) {
        const tableService = TableServiceClient.fromConnectionString(AzureTableStorageConnectionString)
        const tableNames: readonly string[] = await getTableNamesAsync(tableService);
        await Promise.all(tableNames.map(tableName => tableService.deleteTable(tableName)));
    }
    else if (deleteExtraTables) {
        const tableService = TableServiceClient.fromConnectionString(AzureTableStorageConnectionString)
        const tableNames: readonly string[] = await getTableNamesAsync(tableService);
        await Promise.all(tableNames
            .filter(tableName => currentTables.every(table => table.tableName !== tableName))
            .map(tableName => tableService.deleteTable(tableName))
        );
    }

    await Promise.all(currentTables.map(currentTable => currentTable.createTable()));

    async function getTableNamesAsync(tableService: TableServiceClient): Promise<readonly string[]> {
        const tableNames: string[] = [];
        const tablesIterator = await tableService.listTables();
        let result = await tablesIterator.next();
        while (!result.done) {
            if (result.value.name !== undefined)
                tableNames.push(result.value.name);
            result = await tablesIterator.next();
        }

        return tableNames;
    }
}