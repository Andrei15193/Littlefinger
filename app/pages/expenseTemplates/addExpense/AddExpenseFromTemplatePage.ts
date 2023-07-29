import type { IFormQueryHandlerDefinition, IFormCommandHandlerDefinition, FormType } from "../../page";
import type { IAddExpenseFromTemplateRouteParams } from "./AddExpenseFromTemplatePageDefinition";
import type { IExpensePageRequestFormBody } from "../../expenses/IExpensePageRequestFormBody";
import type { IExpenseFormViewOptions } from "../../expenses/IExpenseFormViewOptions";
import { ExpenseForm } from "../../expenses/ExpenseForm";
import { FormPage } from "../../page";
import { GetFilledExpenseQueryHandler } from "./queries/GetFilledExpenseQueryHandler";
import { AddExpenseFromTemplateCommandHandler } from "./commands/AddExpenseCommandHandler";
import { AddExpenseTagCommandHandler } from "./commands/AddExpenseTagCommandHandler";
import { RemoveExpenseTagCommandHandler } from "./commands/RemoveExpenseTagCommandHandler";

export class AddExpenseFromTemplatePage extends FormPage<ExpenseForm, IAddExpenseFromTemplateRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    public readonly route: string = "/expense-templates/:id/add-expense";

    public readonly formType: FormType<ExpenseForm> = ExpenseForm;

    public handlers: [IFormQueryHandlerDefinition<ExpenseForm, IAddExpenseFromTemplateRouteParams, IExpenseFormViewOptions>, ...IFormCommandHandlerDefinition<ExpenseForm, IAddExpenseFromTemplateRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions>[]] = [
        {
            handlerType: GetFilledExpenseQueryHandler
        },
        {
            name: "add",
            handlerType: AddExpenseFromTemplateCommandHandler
        },
        {
            name: "add-tag",
            handlerType: AddExpenseTagCommandHandler
        },
        {
            name: "remove-tag",
            handlerType: RemoveExpenseTagCommandHandler
        }
    ];
}