import type { IUserSession } from "../../model/Users";
import type { ISessionService } from "../ISessionService";

export class SessionServiceMock implements ISessionService {
    public constructor(session?: IUserSession) {
        this.session = session || null;
    }

    public readonly session: IUserSession | null;

    public readonly sessionUpdated: boolean = false;

    public getSignUpUrl(originalUrl: string): string {
        return originalUrl;
    }

    public getSignInUrl(originalUrl: string): string {
        return originalUrl;
    }

    public getPasswordResetUrl(originalUrl: string): string {
        return originalUrl;
    }

    public getOriginalUrl(state: string): string {
        return "/";
    }

    public getSignOutUrl(): string {
        return "/";
    }

    public beginSessionAsync(authenticationCode: string, state: string): Promise<void> {
        return Promise.resolve();
    }

    public tryLoadSessionAsync(userId: string, sessionId: string): Promise<boolean> {
        return Promise.resolve(this.session !== null);
    }

    public endSessionAsync(): Promise<void> {
        return Promise.resolve();
    }
}