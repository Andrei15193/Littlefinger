import type { IUserSession } from "../model/Users";

export interface ISessionService {
    readonly session: IUserSession | null;

    readonly sessionUpdated: boolean;

    getSignInUrlAsync(originalUrl: string): Promise<string>;

    getSignOutUrlAsync(): Promise<string>;

    beginSessionAsync(authenticationCode: string): Promise<void>;

    tryLoadSessionAsync(userId: string, sessionId: string): Promise<boolean>;

    endSessionAsync(): Promise<void>;
}

export interface ILoadSessionResult {
    readonly successful: boolean;
    readonly tokenRefreshed: boolean;
}