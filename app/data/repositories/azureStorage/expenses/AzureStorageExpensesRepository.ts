import type { RestError, TableEntityResult } from "@azure/data-tables";
import type { IExpense, IExpenseKey, IExpenseTag, IExpenseWarning } from "../../../../model/Expenses";
import type { IExpensesRepository } from "../../expenses/IExpensesRepository";
import type { IAzureStorage } from "../../../azureStorage";
import type { IExpenseEntity, IExpenseShopEntity, IExpenseTagEntity } from "../../../azureStorage/entities/Expenses";
import type { IExpenseMonthChangeRequest } from "../../../azureStorage/requests/IExpenseMonthChangeRequest";
import type { WithoutAnyEtag, WithoutRelatedEtags } from "../../../../model/common";
import { v4 as uuid } from "uuid";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";
import { ExpensesUtils } from "../../../../model/ExpensesUtils";
import { AzureQueueStorageUtils } from "../../AzureQueueStorageUtils";
import { ICurrencyEntity } from "../../../azureStorage/entities/Currencies";

export class AzureStorageExpensesRepository implements IExpensesRepository {
    private readonly _userId: string;
    private readonly _azureStorage: IAzureStorage;

    public constructor(userId: string, azureStorage: IAzureStorage) {
        this._userId = userId;
        this._azureStorage = azureStorage;
    }

    public async getAsync(expenseKey: IExpenseKey): Promise<IExpense> {
        try {
            const allExpenseTagsByName = await this._getAllExpenseTagsByNameAsync();
            const expenseEntity = await this._azureStorage.tables.expenses.getEntity<IExpenseEntity>(AzureTableStorageUtils.escapeKeyValue(`${this._userId}-${expenseKey.month}`), AzureTableStorageUtils.escapeKeyValue(expenseKey.id));

            return this._mapExpenseEntity(expenseEntity, allExpenseTagsByName);
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async getAllAsync(expensesMonth: string): Promise<readonly IExpense[]> {
        try {
            const allExpenseTagsByName = await this._getAllExpenseTagsByNameAsync();

            const expenses: IExpense[] = [];
            for await (const expenseEntity of this._azureStorage.tables.expenses.listEntities<IExpenseEntity>({ queryOptions: { filter: `PartitionKey eq ${AzureTableStorageUtils.escapeKeyValue(`'${this._userId}-${expensesMonth}'`)}` } }))
                expenses.push(this._mapExpenseEntity(expenseEntity, allExpenseTagsByName));

            return expenses;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async addAsync(expense: WithoutAnyEtag<Omit<IExpense, "key" | "amount">>): Promise<void> {
        try {
            const expenseMonth = ExpensesUtils.getExpenseMonth(expense.date);
            const partitionKey = `${this._userId}-${expenseMonth}`;
            const expenseId = uuid();

            const expenseEntity: IExpenseEntity = {
                partitionKey: AzureTableStorageUtils.escapeKeyValue(partitionKey),
                rowKey: AzureTableStorageUtils.escapeKeyValue(expenseId),
                month: expenseMonth,
                id: expenseId,
                name: expense.name,
                shop: expense.shop,
                tags: JSON.stringify(expense.tags.map(tag => tag.name)),
                currency: expense.currency.toUpperCase(),
                price: expense.price,
                quantity: expense.quantity,
                date: expense.date,

                state: "ready"
            };
            await this._azureStorage.tables.expenses.createEntity(expenseEntity);
            await this._indexTagsAsync(expense.tags);
            await this._indexShopAsync(expense.shop);
            await this._indexCurrencyAsync(expense.currency);
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async updateAsync(expense: WithoutRelatedEtags<Omit<IExpense, "amount">>): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(expense.etag))
            throw new DataStorageError("InvalidEtag");

        try {
            const partitionKey = `${this._userId}-${expense.key.month}`;
            const newExpenseMonth = ExpensesUtils.getExpenseMonth(expense.date);

            if (expense.key.month === newExpenseMonth)
                await this._azureStorage.tables.expenses.updateEntity<IExpenseEntity>(
                    {
                        partitionKey: AzureTableStorageUtils.escapeKeyValue(partitionKey),
                        rowKey: AzureTableStorageUtils.escapeKeyValue(expense.key.id),
                        month: expense.key.month,
                        id: expense.key.id,
                        name: expense.name,
                        shop: expense.shop,
                        tags: JSON.stringify(expense.tags.map(tag => tag.name)),
                        currency: expense.currency.toUpperCase(),
                        price: expense.price,
                        quantity: expense.quantity,
                        date: expense.date,

                        state: "ready"
                    },
                    "Replace",
                    { etag: expense.etag }
                );
            else {
                const warningActivation = new Date();
                warningActivation.setHours(warningActivation.getHours() + 1);

                await this._azureStorage.tables.expenses.updateEntity<Omit<IExpenseEntity, "date">>(
                    {
                        partitionKey: AzureTableStorageUtils.escapeKeyValue(partitionKey),
                        rowKey: AzureTableStorageUtils.escapeKeyValue(expense.key.id),
                        month: expense.key.month,
                        id: expense.key.id,
                        name: expense.name,
                        shop: expense.shop,
                        tags: JSON.stringify(expense.tags.map(tag => tag.name)),
                        currency: expense.currency.toUpperCase(),
                        price: expense.price,
                        quantity: expense.quantity,

                        state: "changingMonth",
                        warning: JSON.stringify({
                            key: "monthChange",
                            arguments: [expense.date.toISOString()]
                        } as IExpenseWarning),
                        warningActivation
                    },
                    "Merge",
                    { etag: expense.etag }
                );
                await this._azureStorage.queues.expenseMonthChangeRequests.sendMessage(AzureQueueStorageUtils.encodeMessage<IExpenseMonthChangeRequest>({
                    userId: this._userId,
                    expenseKey: expense.key,
                    newExpenseDateString: expense.date.toISOString()
                }));
            }

            await this._indexTagsAsync(expense.tags);
            await this._indexShopAsync(expense.shop);
            await this._indexCurrencyAsync(expense.currency);
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async removeAsync(expenseMonth: string, expenseId: string, expenseEtag: string): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(expenseEtag))
            throw new DataStorageError("InvalidEtag");

        try {
            const partitionKey = `${this._userId}-${expenseMonth}`;
            await this._azureStorage.tables.expenses.deleteEntity(AzureTableStorageUtils.escapeKeyValue(partitionKey), AzureTableStorageUtils.escapeKeyValue(expenseId), { etag: expenseEtag });
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    private async _getAllExpenseTagsByNameAsync(): Promise<Record<string, IExpenseTag>> {
        const allExpenseTagsByName: Record<string, IExpenseTag> = {};

        for await (const tagEntity of this._azureStorage.tables.expenseTags.listEntities<IExpenseTagEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
            if (allExpenseTagsByName[tagEntity.name] === undefined)
                allExpenseTagsByName[tagEntity.name] = {
                    name: tagEntity.name,
                    color: tagEntity.color,
                    state: tagEntity.state,
                    etag: tagEntity.etag
                };

        return allExpenseTagsByName;
    }

    private _mapExpenseEntity(expenseEntity: TableEntityResult<IExpenseEntity>, allExpenseTagsByName: Record<string, IExpenseTag>): IExpense {
        let warning: IExpenseWarning | undefined =
            expenseEntity.warning !== undefined && expenseEntity.warning !== null && expenseEntity.warningActivation !== undefined && expenseEntity.warningActivation !== null
                && expenseEntity.warningActivation < new Date()
                ? JSON.parse(expenseEntity.warning)
                : undefined;

        return {
            key: {
                month: expenseEntity.month,
                id: expenseEntity.id
            },
            name: expenseEntity.name,
            shop: expenseEntity.shop,
            tags: (JSON.parse(expenseEntity.tags) as readonly string[])
                .reduce<IExpenseTag[]>(
                    (result, expenseTagName) => {
                        const expenseTag = allExpenseTagsByName[expenseTagName];
                        if (expenseTag !== undefined && expenseTag !== null)
                            result.push(expenseTag);
                        return result;
                    },
                    []
                ),
            price: expenseEntity.price,
            currency: expenseEntity.currency,
            quantity: expenseEntity.quantity,
            amount: expenseEntity.price * 100 * expenseEntity.quantity / 100,
            date: expenseEntity.date,

            warning,
            state: warning === undefined ? expenseEntity.state : "ready",

            etag: expenseEntity.etag
        };
    }

    private async _indexTagsAsync(expenseTags: readonly WithoutAnyEtag<IExpenseTag>[]): Promise<void> {
        await Promise.all(expenseTags
            .map(async tag => {
                try {
                    await this._azureStorage.tables.expenseTags.createEntity<IExpenseTagEntity>(
                        {
                            partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                            rowKey: AzureTableStorageUtils.escapeKeyValue(tag.name.toLowerCase()),
                            name: tag.name,
                            color: tag.color,
                            state: "ready"
                        }
                    );
                }
                catch (error) {
                    const dataStorageError = new DataStorageError(error as RestError);
                    if (dataStorageError.reason !== "AlreadyExists")
                        throw dataStorageError;
                }
            })
        );
    }

    private async _indexShopAsync(shopName: string): Promise<void> {
        try {
            await this._azureStorage.tables.expenseShops.createEntity<IExpenseShopEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(shopName.toLowerCase()),
                    name: shopName,
                    state: "ready"
                }
            );
        }
        catch (error) {
            const dataStorageError = new DataStorageError(error as RestError);
            if (dataStorageError.reason !== "AlreadyExists")
                throw dataStorageError;
        }
    }

    private async _indexCurrencyAsync(currencyDisplayValue: string): Promise<void> {
        try {
            await this._azureStorage.tables.currencies.createEntity<ICurrencyEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(currencyDisplayValue.toLowerCase()),
                    displayValue: currencyDisplayValue
                }
            );
        }
        catch (error) {
            const dataStorageError = new DataStorageError(error as RestError);
            if (dataStorageError.reason !== "AlreadyExists")
                throw dataStorageError;
        }
    }
}
