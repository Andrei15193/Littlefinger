import type { IPage } from "./page";
import { HomePage } from "./home";
import { AddExpensePage, EditExpensePage, ListExpensesPage } from "./expenses";
import { AddExpenseTemplatePage, EditExpenseTemplatePage, ListExpenseTemplatesPage } from "./expenseTemplates";
import { AddExpenseFromTemplatePage } from "./expenseTemplates/addExpense/AddExpenseFromTemplatePage";
import { ListExpenseShopsPage } from "./expenseShops/index";
import { ListExpenseTagsPage } from "./expenseTags/index";
import { AboutPage } from "./about";
import { AzureActiveDirectoryUserFlowTemplatePage } from "./azureActiveDirectoryUserFlowTemplate/index"

export const pages: IPage[] = [
    new HomePage(),

    new ListExpensesPage(),
    new AddExpensePage(),
    new EditExpensePage(),

    new ListExpenseTemplatesPage(),
    new AddExpenseTemplatePage(),
    new EditExpenseTemplatePage(),
    new AddExpenseFromTemplatePage(),

    new ListExpenseShopsPage(),

    new ListExpenseTagsPage(),

    new AboutPage(),

    new AzureActiveDirectoryUserFlowTemplatePage()
]