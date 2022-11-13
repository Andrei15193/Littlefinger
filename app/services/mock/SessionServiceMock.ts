import type { IUserSession } from "../../model/Users";
import type { ISessionService } from "../ISessionService";

export class SessionServiceMock implements ISessionService {
    public constructor(session?: IUserSession) {
        this.session = session || null;
    }

    public readonly session: IUserSession | null;

    public readonly sessionUpdated: boolean = false;

    public getSignInUrlAsync(originalUrl: string): Promise<string> {
        return Promise.resolve(originalUrl);
    }

    public getSignOutUrlAsync(): Promise<string> {
        return Promise.resolve("/");
    }

    public beginSessionAsync(authenticationCode: string): Promise<void> {
        return Promise.resolve();
    }

    public tryLoadSessionAsync(userId: string, sessionId: string): Promise<boolean> {
        return Promise.resolve(this.session !== null);
    }

    public endSessionAsync(): Promise<void> {
        return Promise.resolve();
    }
}