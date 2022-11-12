import type { IUserSessionData } from "../../../model/Users";

export interface IUserSessionsRepository {
    getAsync(userId: string, sessionId: string): Promise<IUserSessionData>;

    addAsync(userSessionData: IUserSessionData): Promise<void>;

    updateAsync(userSessionData: IUserSessionData): Promise<void>;

    removeAsync(userId: string, sessionId: string): Promise<void>;
}