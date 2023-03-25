import type { TableClient } from "@azure/data-tables";
import type { QueueClient } from "@azure/storage-queue";

export interface IAzureStorage {
    readonly tables: IAzureStorageTables;

    readonly queues: IAzureStorageQueues;
}

export interface IAzureStorageTables {
    readonly userSessions: TableClient;
    readonly currencies: TableClient;
    readonly expenses: TableClient;
    readonly expenseTags: TableClient;
    readonly expenseShops: TableClient;
}

export interface IAzureStorageQueues {
    readonly expenseMonthChangeRequests: QueueClient;
    readonly expenseShopRenameRequests: QueueClient;
    readonly expenseTagRenameRequests: QueueClient;
    readonly expenseTagRemoveRequests: QueueClient;
}