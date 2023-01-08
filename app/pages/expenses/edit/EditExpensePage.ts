import type { IFormQueryHandlerDefinition, IFormCommandHandlerDefinition, FormType } from "../../page";
import type { IExpenseFormViewOptions } from "../IExpenseFormViewOptions";
import type { IEditExpenseRouteParams } from "./EditExpensePageDefinition";
import type { IExpensePageRequestFormBody } from "../IExpensePageRequestFormBody";
import { FormPage } from "../../page";
import { GetExpenseQueryHandler } from "./queries/GetExpenseQueryHandler";
import { EditExpenseCommandHandler } from "./commands/EditExpenseCommandHandler";
import { RemoveExpenseCommandHandler } from "./commands/RemoveExpenseCommandHandler";
import { AddExpenseTagCommandHandler } from "./commands/AddExpenseTagCommandHandler";
import { RemoveExpenseTagCommandHandler } from "./commands/RemoveExpenseTagCommandHandler";
import { ExpenseForm } from "../ExpenseForm";

export class EditExpensePage extends FormPage<ExpenseForm, IEditExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    public readonly route: string = "/expenses/:month(\\d{4}-\\d{2})/:id";

    public readonly formType: FormType<ExpenseForm> = ExpenseForm;

    public readonly handlers: [IFormQueryHandlerDefinition<ExpenseForm, IEditExpenseRouteParams, IExpenseFormViewOptions>, ...IFormCommandHandlerDefinition<ExpenseForm, IEditExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions>[]] = [
        {
            handlerType: GetExpenseQueryHandler
        },
        {
            name: "edit",
            handlerType: EditExpenseCommandHandler
        },
        {
            name: "remove",
            handlerType: RemoveExpenseCommandHandler
        },
        {
            name: "add-tag",
            handlerType: AddExpenseTagCommandHandler
        },
        {
            name: "remove-tag",
            handlerType: RemoveExpenseTagCommandHandler
        }
    ]
}