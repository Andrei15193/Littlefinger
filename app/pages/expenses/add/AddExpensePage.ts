import type { IFormQueryHandlerDefinition, IFormCommandHandlerDefinition, FormType } from "../../page";
import type { IExpenseFormViewOptions } from "../IExpenseFormViewOptions";
import type { IAddExpenseRouteParams } from "./AddExpensePageDefinition";
import type { IExpensePageRequestFormBody } from "../IExpensePageRequestFormBody";
import { ExpenseForm } from "../ExpenseForm";
import { FormPage } from "../../page";
import { GetBlankExpenseQueryHandler } from "./queries/GetBlankExpenseQueryHandler";
import { AddExpenseCommandHandler } from "./commands/AddExpenseCommandHandler";
import { AddExpenseTagCommandHandler } from "./commands/AddExpenseTagCommandHandler";
import { RemoveExpenseTagCommandHandler } from "./commands/RemoveExpenseTagCommandHandler";

export class AddExpensePage extends FormPage<ExpenseForm, IAddExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    public readonly route: string = "/expenses/:month(\\d{4}-\\d{2})?/add";

    public readonly formType: FormType<ExpenseForm> = ExpenseForm;

    public handlers: [IFormQueryHandlerDefinition<ExpenseForm, IAddExpenseRouteParams, IExpenseFormViewOptions>, ...IFormCommandHandlerDefinition<ExpenseForm, IAddExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions>[]] = [
        {
            handlerType: GetBlankExpenseQueryHandler
        },
        {
            name: "add",
            handlerType: AddExpenseCommandHandler
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