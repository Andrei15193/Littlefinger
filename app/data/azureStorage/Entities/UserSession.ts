import type { TableEntity } from "@azure/data-tables";

export interface IUserSessionEntity extends TableEntity {
    readonly userId: string;
    readonly sessionId: string;
    readonly expiration: Date;
    readonly userDisplayName: string;
    readonly userDefaultCurrency: string;
    readonly serializedMsalTokenCache: string;
}