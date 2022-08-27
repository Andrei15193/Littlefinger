import type { TableClient, RestError } from "@azure/data-tables";
import type { IExpenseEntity } from "../IExpenseEntity";
import type { IExpenseCreation } from "./IExpenseCreation";
import type { IExpenseData } from "./IExpenseData";
import type { IExpenseUpdate } from "./IExpenseUpdate";
import { v4 as uuid } from "uuid";
import { DataStorageError } from "../DataStorageError";
import { getExpenseMonth, isInvalidEtag, isValidEtag } from "../DataStorageHelpers";

export class ExpensesDataCollection {
    private readonly _userId: string;
    private readonly _table: TableClient;

    public constructor(userId: string, table: TableClient) {
        this._userId = userId;
        this._table = table;
    }

    public async getAsync(expenseMonth: string, expenseId: string): Promise<IExpenseData> {
        try {
            const expenseEntity = await this._table.getEntity<IExpenseEntity>(`${this._userId}-${expenseMonth}`, expenseId);
            return {
                month: expenseMonth,
                id: expenseId,
                name: expenseEntity.name,
                shop: expenseEntity.shop,
                tags: JSON.parse(expenseEntity.tags),
                price: expenseEntity.price,
                currency: expenseEntity.currency,
                quantity: expenseEntity.quantity,
                date: expenseEntity.date,
                etag: expenseEntity.etag
            }
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async addAsync(expense: IExpenseCreation): Promise<void> {
        try {
            const expenseMonth = getExpenseMonth(expense.date);
            const partitionKey = `${this._userId}-${expenseMonth}`;
            const expenseId = uuid();

            const expenseEntity: IExpenseEntity = {
                partitionKey: partitionKey,
                rowKey: expenseId,
                name: expense.name,
                shop: expense.shop,
                tags: JSON.stringify(expense.tags),
                currency: expense.currency.toUpperCase(),
                price: expense.price,
                quantity: expense.quantity,
                date: expense.date
            };
            await this._table.createEntity(expenseEntity);
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async updateAsync(expenseMonth: string, expenseId: string, expense: IExpenseUpdate): Promise<void> {
        if (isInvalidEtag(expense.etag))
            throw new DataStorageError("Invalid etag");

        const newExpenseMonth = getExpenseMonth(expense.date);
        const partitionKey = `${this._userId}-${expenseMonth}`;

        try {
            if (expenseMonth === newExpenseMonth)
                await this._table.updateEntity<IExpenseEntity>(
                    {
                        partitionKey,
                        rowKey: expenseId,
                        name: expense.name,
                        shop: expense.shop,
                        tags: JSON.stringify(expense.tags),
                        currency: expense.currency.toUpperCase(),
                        price: expense.price,
                        quantity: expense.quantity,
                        date: expense.date
                    },
                    "Replace",
                    { etag: expense.etag }
                );
            else {
                const newPartitionKey = `${this._userId}-${newExpenseMonth}`;

                await this._table.deleteEntity(partitionKey, expenseId, { etag: expense.etag });
                await this._table.createEntity<IExpenseEntity>({
                    partitionKey: newPartitionKey,
                    rowKey: expenseId,
                    name: expense.name,
                    shop: expense.shop,
                    tags: JSON.stringify(expense.tags),
                    currency: expense.currency,
                    price: expense.price,
                    quantity: expense.quantity,
                    date: expense.date
                });
            }
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async deleteAsync(expenseMonth: string, expenseId: string, etag: string): Promise<void> {
        if (isInvalidEtag(etag))
            throw new DataStorageError("Invalid etag");

        try {
            const partitionKey = `${this._userId}-${expenseMonth}`;
            await this._table.deleteEntity(partitionKey, expenseId, { etag });
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }
}