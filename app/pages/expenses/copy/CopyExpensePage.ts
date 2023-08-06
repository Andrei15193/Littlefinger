import type { IFormQueryHandlerDefinition, IFormCommandHandlerDefinition, FormType } from "../../page";
import type { IExpenseFormViewOptions } from "../IExpenseFormViewOptions";
import type { ICopyExpenseRouteParams } from "./CopyExpensePageDefinition";
import type { IExpensePageRequestFormBody } from "../IExpensePageRequestFormBody";
import { FormPage } from "../../page";
import { GetExpenseQueryHandler } from "./queries/GetExpenseQueryHandler";
import { CopyExpenseCommandHandler } from "./commands/CopyExpenseCommandHandler";
import { AddExpenseTagCommandHandler } from "./commands/AddExpenseTagCommandHandler";
import { RemoveExpenseTagCommandHandler } from "./commands/RemoveExpenseTagCommandHandler";
import { ExpenseForm } from "../ExpenseForm";

export class CopyExpensePage extends FormPage<ExpenseForm, ICopyExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    public readonly route: string = "/expenses/:month(\\d{4}-\\d{2})/:id/copy";

    public readonly formType: FormType<ExpenseForm> = ExpenseForm;

    public readonly handlers: [IFormQueryHandlerDefinition<ExpenseForm, ICopyExpenseRouteParams, IExpenseFormViewOptions>, ...IFormCommandHandlerDefinition<ExpenseForm, ICopyExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions>[]] = [
        {
            handlerType: GetExpenseQueryHandler
        },
        {
            name: "copy",
            handlerType: CopyExpenseCommandHandler
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