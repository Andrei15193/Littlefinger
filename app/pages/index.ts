import type { IPage } from "./page";
import { HomePage } from "./home";
import { AddExpensePage, EditExpensePage, CopyExpensePage, ListExpensesPage } from "./expenses";
import { AddExpenseTemplatePage, EditExpenseTemplatePage, AddExpenseFromTemplatePage, ListExpenseTemplatesPage } from "./expenseTemplates";
import { ListExpenseShopsPage } from "./expenseShops";
import { ListExpenseTagsPage } from "./expenseTags";
import { AboutPage } from "./about";
import { AzureActiveDirectoryUserFlowTemplatePage } from "./azureActiveDirectoryUserFlowTemplate/index"

export const pages: IPage[] = [
    new HomePage(),

    new ListExpensesPage(),
    new AddExpensePage(),
    new EditExpensePage(),
    new CopyExpensePage(),

    new ListExpenseTemplatesPage(),
    new AddExpenseTemplatePage(),
    new EditExpenseTemplatePage(),
    new AddExpenseFromTemplatePage(),

    new ListExpenseShopsPage(),

    new ListExpenseTagsPage(),

    new AboutPage(),

    new AzureActiveDirectoryUserFlowTemplatePage()
]