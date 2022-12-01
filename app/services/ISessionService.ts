import type { IUserSession } from "../model/Users";

export interface ISessionService {
    readonly session: IUserSession | null;

    readonly sessionUpdated: boolean;

    getSignUpUrl(originalUrl: string): string;

    getSignInUrl(originalUrl: string): string;

    getPasswordResetUrl(originalUrl: string): string;

    getOriginalUrl(state: string): string;

    getSignOutUrl(): string;

    beginSessionAsync(authenticationCode: string, state: string): Promise<void>;

    tryLoadSessionAsync(userId: string, sessionId: string): Promise<boolean>;

    endSessionAsync(): Promise<void>;
}

export interface ILoadSessionResult {
    readonly successful: boolean;
    readonly tokenRefreshed: boolean;
}

export enum AuthenticationFlow {
    Register,
    AuthenticateOrRegister,
    PasswordChange
}