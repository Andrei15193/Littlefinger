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
            this.users = TableClient.fromConnectionString(azureStorageConnectionString, "users"),
            this.expenses = TableClient.fromConnectionString(azureStorageConnectionString, "expenses"),
            this.expenseTags = TableClient.fromConnectionString(azureStorageConnectionString, "expenseTags")
        ];
    }

    public readonly users: TableClient;
    public readonly expenses: TableClient;
    public readonly expenseTags: TableClient;

    public readonly tableService: TableServiceClient;

    public readonly all: readonly TableClient[];
}

class AzureStorageQueues implements IAzureStorageQueues {
    public constructor(azureStorageConnectionString: string) {
        this.queueService = QueueServiceClient.fromConnectionString(azureStorageConnectionString);
        this.all = [
            this.expensesMonthChangeRequests = this.queueService.getQueueClient("expenses-month-change-requests")
        ];
    }

    public readonly expensesMonthChangeRequests: QueueClient;

    public readonly queueService: QueueServiceClient;

    public readonly all: readonly QueueClient[];
}