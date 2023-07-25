import type { WithoutAnyEtag, WithoutRelatedEtags } from "../../../../model/common";
import type { RestError, TableEntityResult } from "@azure/data-tables";
import type { IExpenseTemplatesRepository } from "../../expenses/IExpenseTemplatesRepository";
import type { IExpenseTag, IExpenseTemplate } from "../../../../model/Expenses";
import type { IExpenseShopEntity, IExpenseTagEntity, IExpenseTemplateEntity } from "../../../azureStorage/entities/Expenses";
import type { ICurrencyEntity } from "../../../azureStorage/entities/Currencies";
import type { IAzureStorage } from "../../../azureStorage";
import { v4 as uuid } from "uuid";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";

export class AzureStorageExpenseTemplatesRepository implements IExpenseTemplatesRepository {
    private readonly _userId: string;
    private readonly _azureStorage: IAzureStorage;

    public constructor(userId: string, azureStorage: IAzureStorage) {
        this._userId = userId;
        this._azureStorage = azureStorage;
    }

    public async getAsync(expenseTemplateId: string): Promise<IExpenseTemplate> {
        try {
            const allExpenseTagsByName = await this._getAllExpenseTagsByNameAsync();

            const expenseTemplateEntity = await this._azureStorage.tables.expenseTemplates.getEntity<IExpenseTemplateEntity>(AzureTableStorageUtils.escapeKeyValue(this._userId), AzureTableStorageUtils.escapeKeyValue(expenseTemplateId));

            const expenseTemplate = this._mapExpenseTemplateEntity(expenseTemplateEntity, allExpenseTagsByName);
            return expenseTemplate;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async getAllAsync(): Promise<readonly IExpenseTemplate[]> {
        try {
            const expenseTemplates: IExpenseTemplate[] = [];
            const allExpenseTagsByName = await this._getAllExpenseTagsByNameAsync();

            for await (const expenseTemplateEntity of this._azureStorage.tables.expenseTemplates.listEntities<IExpenseTemplateEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                expenseTemplates.push(this._mapExpenseTemplateEntity(expenseTemplateEntity, allExpenseTagsByName));

            return expenseTemplates;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async addAsync(expenseTemplate: WithoutAnyEtag<Omit<IExpenseTemplate, "id" | "amount">>): Promise<void> {
        try {
            const expenseTemplateId = uuid();

            const expenseTemplateEntity: IExpenseTemplateEntity = {
                partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                rowKey: AzureTableStorageUtils.escapeKeyValue(expenseTemplateId),
                id: expenseTemplateId,
                name: expenseTemplate.name,
                shop: expenseTemplate.shop,
                tags: JSON.stringify(expenseTemplate.tags.map(tag => tag.name)),
                currency: expenseTemplate.currency.toUpperCase(),
                price: expenseTemplate.price,
                quantity: expenseTemplate.quantity,
                dayOfMonth: expenseTemplate.dayOfMonth
            };
            await this._azureStorage.tables.expenseTemplates.createEntity(expenseTemplateEntity);
            await this._indexTagsAsync(expenseTemplate.tags);
            await this._indexShopAsync(expenseTemplate.shop);
            await this._indexCurrencyAsync(expenseTemplate.currency);
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }
    public async updateAsync(expenseTemplate: WithoutRelatedEtags<Omit<IExpenseTemplate, "amount">>): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(expenseTemplate.etag))
            throw new DataStorageError("InvalidEtag");

        try {
            await this._azureStorage.tables.expenseTemplates.updateEntity<IExpenseTemplateEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(expenseTemplate.id),
                    id: expenseTemplate.id,
                    name: expenseTemplate.name,
                    shop: expenseTemplate.shop,
                    tags: JSON.stringify(expenseTemplate.tags.map(tag => tag.name)),
                    currency: expenseTemplate.currency.toUpperCase(),
                    price: expenseTemplate.price,
                    quantity: expenseTemplate.quantity,
                    dayOfMonth: expenseTemplate.dayOfMonth
                },
                "Replace",
                { etag: expenseTemplate.etag }
            );

            await this._indexTagsAsync(expenseTemplate.tags);
            await this._indexShopAsync(expenseTemplate.shop);
            await this._indexCurrencyAsync(expenseTemplate.currency);
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async removeAsync(expenseTemplateId: string, expenseTemplateEtag: string): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(expenseTemplateEtag))
            throw new DataStorageError("InvalidEtag");

        try {
            await this._azureStorage.tables.expenseTemplates.deleteEntity(AzureTableStorageUtils.escapeKeyValue(this._userId), AzureTableStorageUtils.escapeKeyValue(expenseTemplateId), { etag: expenseTemplateEtag });
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

    private _mapExpenseTemplateEntity(expenseTemplateEntity: TableEntityResult<IExpenseTemplateEntity>, allExpenseTagsByName: Record<string, IExpenseTag>): IExpenseTemplate {
        return {
            id: expenseTemplateEntity.rowKey,
            name: expenseTemplateEntity.name,
            shop: expenseTemplateEntity.shop,
            tags: (JSON.parse(expenseTemplateEntity.tags) as readonly string[])
                .reduce<IExpenseTag[]>(
                    (result, expenseTagName) => {
                        const expenseTag = allExpenseTagsByName[expenseTagName];
                        if (expenseTag !== undefined && expenseTag !== null)
                            result.push(expenseTag);
                        return result;
                    },
                    []
                ),
            price: expenseTemplateEntity.price,
            currency: expenseTemplateEntity.currency,
            quantity: expenseTemplateEntity.quantity,
            amount: expenseTemplateEntity.price * 100 * expenseTemplateEntity.quantity / 100,
            dayOfMonth: expenseTemplateEntity.dayOfMonth,
            etag: expenseTemplateEntity.etag
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