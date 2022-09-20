import type { ITranslation } from "../translations/translation";
import type { IApplicationTabs } from "../applicationTabs";
import type { IExpensesRepository } from "../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../data/repositories/expenses/IExpenseTagsRepository";
import type { IUser } from "../model/Users";

export interface IDependencyContainer {
    readonly user: IUser;

    readonly translation: ITranslation;

    readonly tabs: IApplicationTabs;

    readonly expensesRepository: IExpensesRepository;

    readonly expenseTagsRepository: IExpenseTagsRepository;
}