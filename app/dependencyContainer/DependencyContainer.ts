import type { IDependencyContainer } from "./index";
import type { ITranslation } from "../translations/Translation";
import type { IApplicationTabs } from "../ApplicationTabs";
import type { IAzureStorage } from "../data/azureStorage";
import type { IUserSessionsRepository } from "../data/repositories/users/IUserSessionsRepository";
import type { IExpensesRepository } from "../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../data/repositories/expenses/IExpenseTagsRepository";
import type { IUser } from "../model/Users";
import type { ISessionService } from "../services/ISessionService";
import { AzureStorageUserSessionsRepository } from "../data/repositories/azureStorage/users/AzureStorageUserSessionsRepository";
import { AzureActiveDirectorySessionService } from "../services/azureActiveDirectory/AzureActiveDirectorySessionService";
import { AzureStorageExpensesRepository } from "../data/repositories/azureStorage/expenses/AzureStorageExpensesRepository";
import { AzureStorageExpenseTagsRepository } from "../data/repositories/azureStorage/expenses/AzureStorageExpenseTagsRepository";
import { AzureStorage } from "../data/azureStorage/AzureStorage";
import { ApplicationTabs } from "../ApplicationTabs";

export class DependencyContainer implements IDependencyContainer {
    private readonly _instances: Record<string, any>;
    private readonly _azureStorageConnectionString: string;
    private readonly _replacements: Partial<DependencyContainer>;

    public constructor(azureStorageConnectionString: string, translation: ITranslation, replacements: Partial<Omit<DependencyContainer, "user">> = {}) {
        if (azureStorageConnectionString === undefined || azureStorageConnectionString === null)
            throw new Error("Expected 'azureStorageConnectionString'");
        if (translation === undefined || translation === null)
            throw new Error("Expected 'translation'");

        this._instances = {};
        this._replacements = replacements;
        this._azureStorageConnectionString = azureStorageConnectionString;
        this.tabs = new ApplicationTabs(translation);
        this.translation = translation;
    }

    public get user(): IUser | null {
        return this.sessionService.session === null ? null : this.sessionService.session.user;
    }

    public get sessionService(): ISessionService {
        return this._getInstance("ISessionService", this._replacements.sessionService, AzureActiveDirectorySessionService, this.userSessionsRepository);
    }

    public get userSessionsRepository(): IUserSessionsRepository {
        return this._getInstance("IUserSessionsRepository", this._replacements.userSessionsRepository, AzureStorageUserSessionsRepository, this.azureStorage);
    }

    public get expensesRepository(): IExpensesRepository {
        return this._getInstance("IExpensesRepository", this._replacements.expensesRepository, AzureStorageExpensesRepository, this._userId, this.azureStorage);
    }

    public get expenseTagsRepository(): IExpenseTagsRepository {
        return this._getInstance("IExpenseTagsRepository", this._replacements.expenseTagsRepository, AzureStorageExpenseTagsRepository, this._userId, this.azureStorage);
    }

    public get azureStorage(): IAzureStorage {
        return this._getInstance("IAzureStorage", this._replacements.azureStorage, AzureStorage, this._azureStorageConnectionString);
    }

    public readonly tabs: IApplicationTabs;

    public readonly translation: ITranslation;

    private get _userId(): string {
        const { session } = this.sessionService;
        if (session === null)
            throw new Error("User is not authenticated");
        else
            return session.user.id;
    }

    private _getInstance<TItem, TArgs extends readonly any[]>(name: string, replacement: TItem | undefined | null, type: { new(...args: TArgs): TItem }, ...args: TArgs): TItem {
        let item = this._instances[name];
        if (item === undefined) {
            item = replacement !== null && replacement !== undefined ? replacement : new type(...args);
            this._instances[name] = item;
        }

        return item;
    }
}