import type { IDependencyContainer } from "./index";
import type { IUser } from "../model/Users";
import type { ITranslation } from "../translations/translation";
import type { IApplicationTabs } from "../applicationTabs";
import type { IAzureStorage } from "../data/azureStorage";
import type { IExpensesRepository } from "../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../data/repositories/expenses/IExpenseTagsRepository";
import { AzureStorageExpensesRepository } from "../data/repositories/azureStorage/expenses/AzureStorageExpensesRepository";
import { AzureStorageExpenseTagsRepository } from "../data/repositories/azureStorage/expenses/AzureStorageExpenseTagsRepository";
import { AzureStorage } from "../data/azureStorage/AzureStorage";
import { ApplicationTabs } from "../applicationTabs";

export class DependencyContainer implements IDependencyContainer {
    private readonly _instances: Record<string, any>;
    private readonly _azureStorageConnectionString: string;

    public constructor(user: IUser, azureStorageConnectionString: string, translation: ITranslation) {
        if (azureStorageConnectionString === undefined || azureStorageConnectionString === null)
            throw new Error("Expected 'azureStorageConnectionString'");
        if (translation === undefined || translation === null)
            throw new Error("Expected 'translation'");

        this._instances = {};
        this._azureStorageConnectionString = azureStorageConnectionString;
        this.tabs = new ApplicationTabs(translation);
        this.translation = translation;
        this.user = user;
    }

    public get expensesRepository(): IExpensesRepository {
        return this._getInstance("IExpensesRepository", AzureStorageExpensesRepository, this.user.id, this.azureStorage);
    }

    public get expenseTagsRepository(): IExpenseTagsRepository {
        return this._getInstance("IExpenseTagsRepository", AzureStorageExpenseTagsRepository, this.user.id, this.azureStorage);
    }

    public get azureStorage(): IAzureStorage {
        return this._getInstance("IAzureStorage", AzureStorage, this._azureStorageConnectionString);
    }

    public readonly tabs: IApplicationTabs;

    public readonly translation: ITranslation;

    public readonly user: IUser;

    private _getInstance<TItem, TArgs extends readonly any[]>(name: string, type: { new(...args: TArgs): TItem }, ...args: TArgs): TItem {
        let item = this._instances[name];
        if (item === undefined) {
            item = new type(...args);
            this._instances[name] = item;
        }

        return item;
    }
}