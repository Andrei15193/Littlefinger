import type { WithoutEtag, WithoutState } from "../../../../model/common";
import type { RestError, TableEntityResult } from "@azure/data-tables";
import type { IExpenseTag, IExpenseTagWarning } from "../../../../model/Expenses";
import type { IExpenseTagsRepository } from "../../expenses/IExpenseTagsRepository";
import type { IAzureStorage } from "../../../azureStorage";
import type { IExpenseTagEntity } from "../../../azureStorage/entities/Expenses";
import type { IExpenseTagRenameRequest } from "../../../azureStorage/requests/IExpenseTagRenameRequest";
import type { IExpenseTagRemoveRequest } from "../../../azureStorage/requests/IExpenseTagRemoveRequest";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";
import { AzureQueueStorageUtils } from "../../AzureQueueStorageUtils";

export class AzureStorageExpenseTagsRepository implements IExpenseTagsRepository {
    private readonly _userId: string;
    private readonly _azureStorage: IAzureStorage;

    public constructor(userId: string, azureStorage: IAzureStorage) {
        this._userId = userId;
        this._azureStorage = azureStorage;
    }

    public async getByNameAsync(tagName: string): Promise<IExpenseTag> {
        if (tagName === undefined || tagName === null)
            throw new DataStorageError("NotFound");

        try {
            let expenseTagEntity = await this._azureStorage.tables.expenseTags.getEntity<IExpenseTagEntity>(
                AzureTableStorageUtils.escapeKeyValue(this._userId),
                AzureTableStorageUtils.escapeKeyValue(tagName.toLowerCase())
            );
            const expenseTag = this._mapExpenseTagEntity(expenseTagEntity);

            return expenseTag;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async getAllAsync(): Promise<readonly IExpenseTag[]> {
        try {
            const expenseTags: IExpenseTag[] = [];

            for await (const expenseTagEntity of this._azureStorage.tables.expenseTags.listEntities<IExpenseTagEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                expenseTags.push(this._mapExpenseTagEntity(expenseTagEntity));

            return expenseTags;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async getAllByNameAsync(): Promise<{ readonly [tagName: string]: IExpenseTag; }> {
        try {
            const expenseTagsByName: Record<string, IExpenseTag> = {};

            for await (const expenseTagEntity of this._azureStorage.tables.expenseTags.listEntities<IExpenseTagEntity>({ queryOptions: { filter: `PartitionKey eq '${AzureTableStorageUtils.escapeKeyValue(this._userId)}'` } }))
                if (expenseTagsByName[expenseTagEntity.name] === undefined)
                    expenseTagsByName[expenseTagEntity.name] = this._mapExpenseTagEntity(expenseTagEntity);

            return expenseTagsByName;
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async updateAsync(initialExpenseTagName: string, initialExpenseTagEtag: string, expenseTag: WithoutEtag<WithoutState<IExpenseTag>>): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(initialExpenseTagEtag))
            throw new DataStorageError("InvalidEtag");

        if (initialExpenseTagName === expenseTag.name)
            await this._azureStorage.tables.expenseTags.updateEntity<IExpenseTagEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(expenseTag.name.toLowerCase()),
                    name: expenseTag.name,
                    color: expenseTag.color,
                    state: "ready"
                },
                "Replace",
                { etag: initialExpenseTagEtag }
            );
        else {
            const warningActivation = new Date();
            warningActivation.setHours(warningActivation.getHours() + 1);

            try {
                if (initialExpenseTagName.localeCompare(expenseTag.name, "en-GB", { sensitivity: "base" }) !== 0)
                    await this._ensureDestinationExpenseTagAsync(initialExpenseTagName, expenseTag, warningActivation);

                await this._azureStorage.tables.expenseTags.updateEntity<Omit<IExpenseTagEntity, "name">>(
                    {
                        partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                        rowKey: AzureTableStorageUtils.escapeKeyValue(initialExpenseTagName.toLowerCase()),
                        color: expenseTag.color,
                        state: "renaming",
                        warning: JSON.stringify({
                            key: "rename",
                            arguments: [expenseTag.name]
                        } as IExpenseTagWarning),
                        warningActivation
                    },
                    "Merge",
                    { etag: initialExpenseTagEtag }
                );

                await this._azureStorage.queues.expenseTagRenameRequests.sendMessage(AzureQueueStorageUtils.encodeMessage<IExpenseTagRenameRequest>({
                    userId: this._userId,
                    initialExpenseTagName,
                    newExpenseTagName: expenseTag.name
                }));
            }
            catch (error) {
                if (error instanceof DataStorageError)
                    throw error;

                throw new DataStorageError(error as RestError);
            }
        }
    }

    public async removeAsync(expenseTagName: string, expenseTagEtag: string): Promise<void> {
        if (AzureTableStorageUtils.isInvalidEtag(expenseTagEtag))
            throw new DataStorageError("InvalidEtag");

        const warningActivation = new Date();
        warningActivation.setHours(warningActivation.getHours() + 1);

        try {
            await this._azureStorage.tables.expenseTags.updateEntity<Omit<IExpenseTagEntity, "name" | "color">>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(expenseTagName.toLowerCase()),
                    state: "removing",
                    warning: JSON.stringify({
                        key: "remove"
                    } as IExpenseTagWarning),
                    warningActivation
                },
                "Merge",
                { etag: expenseTagEtag }
            );

            await this._azureStorage.queues.expenseTagRemoveRequests.sendMessage(AzureQueueStorageUtils.encodeMessage<IExpenseTagRemoveRequest>({
                userId: this._userId,
                expenseTagName: expenseTagName
            }));
        }
        catch (error) {
            if (error instanceof DataStorageError)
                throw error;

            throw new DataStorageError(error as RestError);
        }
    }

    private _mapExpenseTagEntity(expenseTagEntity: TableEntityResult<IExpenseTagEntity>): IExpenseTag {
        let warning: IExpenseTagWarning | undefined =
            expenseTagEntity.warning !== undefined && expenseTagEntity.warning !== null && expenseTagEntity.warningActivation !== undefined && expenseTagEntity.warningActivation !== null
                && expenseTagEntity.warningActivation < new Date()
                ? JSON.parse(expenseTagEntity.warning)
                : undefined;

        return {
            name: expenseTagEntity.name,
            color: expenseTagEntity.color,
            state: warning === undefined ? expenseTagEntity.state : "ready",
            warning,
            etag: expenseTagEntity.etag
        };
    }

    private async _ensureDestinationExpenseTagAsync(initialExpenseTagName: string, expenseTag: WithoutEtag<WithoutState<IExpenseTag>>, warningActivation: Date): Promise<void> {
        let destinationExpenseTagEntity: TableEntityResult<IExpenseTagEntity> | null = null;
        try {
            destinationExpenseTagEntity = await this._azureStorage.tables.expenseTags.getEntity<IExpenseTagEntity>(AzureTableStorageUtils.escapeKeyValue(this._userId), AzureTableStorageUtils.escapeKeyValue(expenseTag.name.toLowerCase()));
        }
        catch (error) {
            const dataStorageError = new DataStorageError(error as RestError);
            if (dataStorageError.reason !== "NotFound")
                throw dataStorageError;
        }

        if (destinationExpenseTagEntity === null)
            await this._azureStorage.tables.expenseTags.createEntity<IExpenseTagEntity>({
                partitionKey: AzureTableStorageUtils.escapeKeyValue(this._userId),
                rowKey: AzureTableStorageUtils.escapeKeyValue(expenseTag.name.toLowerCase()),
                color: expenseTag.color,
                name: expenseTag.name,
                state: "renaming",
                warning: JSON.stringify({
                    key: "renameTarget",
                    arguments: [initialExpenseTagName]
                } as IExpenseTagWarning),
                warningActivation
            });
        else {
            if (destinationExpenseTagEntity.state !== "ready" && !AzureTableStorageUtils.hasWarning(destinationExpenseTagEntity))
                throw new DataStorageError("TargetNotReady");

            await this._azureStorage.tables.expenseTags.updateEntity<Omit<IExpenseTagEntity, "name">>(
                {
                    partitionKey: destinationExpenseTagEntity.partitionKey,
                    rowKey: destinationExpenseTagEntity.rowKey,
                    state: "renaming",
                    warning: JSON.stringify({
                        key: "renameTarget",
                        arguments: [initialExpenseTagName]
                    } as IExpenseTagWarning),
                    warningActivation
                },
                "Merge",
                { etag: destinationExpenseTagEntity.etag }
            );
        }
    }
}