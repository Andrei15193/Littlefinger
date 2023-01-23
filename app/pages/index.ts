import type { IPage } from "./page";
import { HomePage } from "./home";
import { AddExpensePage, EditExpensePage, ListExpensesPage } from "./expenses";
import { AboutPage } from "./about";
import { AzureActiveDirectoryUserFlowTemplatePage } from "./azureActiveDirectoryUserFlowTemplate/index"
import { ListExpenseShopsPage } from "./expenseShops/index";

export const pages: IPage[] = [
    new HomePage(),

    new ListExpensesPage(),
    new AddExpensePage(),
    new EditExpensePage(),

    new ListExpenseShopsPage(),

    new AboutPage(),

    new AzureActiveDirectoryUserFlowTemplatePage()
]