import type { IAzureStorage, IAzureStorageTables } from "./index";
import { TableClient, TableServiceClient } from "@azure/data-tables";

export class AzureStorage implements IAzureStorage {
    public constructor(azureStorageConnectionString: string) {
        this.tables = new AzureStorageTables(azureStorageConnectionString);
    }

    public readonly tables: AzureStorageTables;
}

class AzureStorageTables extends Array<TableClient> implements IAzureStorageTables {
    public constructor(azureStorageConnectionString: string) {
        super();
        this.tableService = TableServiceClient.fromConnectionString(azureStorageConnectionString);
        this.push(
            this.users = TableClient.fromConnectionString(azureStorageConnectionString, "users"),
            this.expenses = TableClient.fromConnectionString(azureStorageConnectionString, "expenses"),
            this.expenseTags = TableClient.fromConnectionString(azureStorageConnectionString, "expenseTags")
        );
    }

    public readonly users: TableClient;
    public readonly expenses: TableClient;
    public readonly expenseTags: TableClient;

    public readonly tableService: TableServiceClient;
}