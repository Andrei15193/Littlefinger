import type { RestError } from "@azure/data-tables";
import type { IAzureStorage } from "../../../azureStorage";
import type { IUserSessionData } from "../../../../model/Users";
import type { IUserSessionsRepository } from "../../users/IUserSessionsRepository";
import type { IUserSessionEntity } from "../../../azureStorage/entities/UserSession";
import { DataStorageError } from "../../../DataStorageError";
import { AzureTableStorageUtils } from "../../AzureTableStorageUtils";

export class AzureStorageUserSessionsRepository implements IUserSessionsRepository {
    private readonly _azureStorage: IAzureStorage;

    public constructor(azureStorage: IAzureStorage) {
        this._azureStorage = azureStorage;
    }

    public async getAsync(userId: string, sessionId: string): Promise<IUserSessionData> {
        try {
            const userSessionEntity = await this._azureStorage.tables.userSessions.getEntity<IUserSessionEntity>(userId, sessionId);
            return {
                sessionId: userSessionEntity.sessionId,
                user: {
                    id: userSessionEntity.userId,
                    displayName: userSessionEntity.userDisplayName,
                    defaultCurrency: userSessionEntity.userDefaultCurrency
                },
                expiration: userSessionEntity.expiration,
                serializedMsalTokenCache: userSessionEntity.serializedMsalTokenCache
            }
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async addAsync(userSessionData: IUserSessionData): Promise<void> {
        try {
            await this._azureStorage.tables.userSessions.createEntity<IUserSessionEntity>({
                partitionKey: AzureTableStorageUtils.escapeKeyValue(userSessionData.user.id),
                rowKey: AzureTableStorageUtils.escapeKeyValue(userSessionData.sessionId),
                sessionId: userSessionData.sessionId,
                userId: userSessionData.user.id,
                userDisplayName: userSessionData.user.displayName,
                userDefaultCurrency: userSessionData.user.defaultCurrency,
                expiration: userSessionData.expiration,
                serializedMsalTokenCache: userSessionData.serializedMsalTokenCache
            });
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async updateAsync(userSessionData: IUserSessionData): Promise<void> {
        try {
            await this._azureStorage.tables.userSessions.updateEntity<IUserSessionEntity>(
                {
                    partitionKey: AzureTableStorageUtils.escapeKeyValue(userSessionData.user.id),
                    rowKey: AzureTableStorageUtils.escapeKeyValue(userSessionData.sessionId),
                    sessionId: userSessionData.sessionId,
                    userId: userSessionData.user.id,
                    userDisplayName: userSessionData.user.displayName,
                    userDefaultCurrency: userSessionData.user.defaultCurrency,
                    expiration: userSessionData.expiration,
                    serializedMsalTokenCache: userSessionData.serializedMsalTokenCache
                },
                "Replace",
                { etag: "*" }
            );
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }

    public async removeAsync(userId: string, sessionId: string): Promise<void> {
        try {
            await this._azureStorage.tables.userSessions.deleteEntity(AzureTableStorageUtils.escapeKeyValue(userId), AzureTableStorageUtils.escapeKeyValue(sessionId), { etag: "*" });
        }
        catch (error) {
            throw new DataStorageError(error as RestError);
        }
    }
}