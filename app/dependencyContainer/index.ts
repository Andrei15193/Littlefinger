import type { ITranslation } from "../translations/Translation";
import type { IApplicationTabs } from "../ApplicationTabs";
import type { IExpensesRepository } from "../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../data/repositories/expenses/IExpenseTagsRepository";
import type { ISessionService } from "../services/ISessionService";
import type { IUser } from "../model/Users";

export interface IDependencyContainer {
    readonly translation: ITranslation;

    readonly tabs: IApplicationTabs;

    readonly user: IUser | null;

    readonly sessionService: ISessionService;

    readonly expensesRepository: IExpensesRepository;

    readonly expenseTagsRepository: IExpenseTagsRepository;
}