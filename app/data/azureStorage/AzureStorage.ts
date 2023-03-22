import type { IAzureStorage, IAzureStorageQueues, IAzureStorageTables } from "./index";
import { TableClient, TableServiceClient } from "@azure/data-tables";
import { QueueClient, QueueServiceClient } from "@azure/storage-queue";

export class AzureStorage implements IAzureStorage {
    public constructor(azureStorageConnectionString: string) {
        this.tables = new AzureStorageTables(azureStorageConnectionString);
        this.queues = new AzureStorageQueues(azureStorageConnectionString);
    }

    public readonly tables: AzureStorageTables;

    public readonly queues: AzureStorageQueues;
}

class AzureStorageTables implements IAzureStorageTables {
    public constructor(azureStorageConnectionString: string) {
        this.tableService = TableServiceClient.fromConnectionString(azureStorageConnectionString);
        this.all = [
            this.userSessions = TableClient.fromConnectionString(azureStorageConnectionString, "userSessions"),
            this.currencies = TableClient.fromConnectionString(azureStorageConnectionString, "currencies"),
            this.expenses = TableClient.fromConnectionString(azureStorageConnectionString, "expenses"),
            this.expenseTags = TableClient.fromConnectionString(azureStorageConnectionString, "expenseTags"),
            this.expenseShops = TableClient.fromConnectionString(azureStorageConnectionString, "expenseShops")
        ];
    }

    public readonly userSessions: TableClient;
    public readonly currencies: TableClient;
    public readonly expenses: TableClient;
    public readonly expenseTags: TableClient;
    public readonly expenseShops: TableClient;

    public readonly tableService: TableServiceClient;

    public readonly all: readonly TableClient[];
}

class AzureStorageQueues implements IAzureStorageQueues {
    public constructor(azureStorageConnectionString: string) {
        this.queueService = QueueServiceClient.fromConnectionString(azureStorageConnectionString);
        this.all = [
            this.expenseMonthChangeRequests = this.queueService.getQueueClient("expense-month-change-requests"),
            this.expenseShopRenameRequests = this.queueService.getQueueClient("expense-shop-rename-requests"),
            this.expenseTagRenameRequests = this.queueService.getQueueClient("expense-tag-rename-requests")
        ];
    }

    public readonly expenseMonthChangeRequests: QueueClient;

    public readonly expenseShopRenameRequests: QueueClient;

    public readonly expenseTagRenameRequests: QueueClient;

    public readonly queueService: QueueServiceClient;

    public readonly all: readonly QueueClient[];
}