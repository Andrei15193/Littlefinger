import type { TableClient } from "@azure/data-tables";

export interface IAzureStorage {
    readonly tables: IAzureStorageTables;
}

export interface IAzureStorageTables extends Readonly<Array<TableClient>> {
    readonly users: TableClient;
    readonly expenses: TableClient;
    readonly expenseTags: TableClient;
}