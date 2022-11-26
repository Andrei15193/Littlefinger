import type { AuthenticationFlow } from "../services/ISessionService";

export interface IUser {
    readonly id: string;
    readonly displayName: string;
    readonly defaultCurrency: string;
}

export interface IUserSession {
    readonly id: string;
    readonly user: IUser;
    readonly authenticationFlow: AuthenticationFlow;
    readonly expiration: Date;
}

export interface IUserSessionData {
    readonly sessionId: string;
    readonly user: IUser;
    readonly expiration: Date;
    readonly authenticationFlow: AuthenticationFlow;
    readonly serializedMsalTokenCache: string;
}