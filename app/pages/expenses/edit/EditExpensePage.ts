import type { IExpenseFormViewOptions } from "../IExpenseFormViewOptions";
import type { IEditExpenseRouteParams } from "./EditExpensePageDefinition";
import type { ICommandHandlerDefinition, QueryHandlerConfiguration } from "../../page";
import type { PageRequestBody } from "../../page/IBasePageRequestBody";
import type { IExpenseFormData } from "../ExpenseForm";
import { Page } from "../../page";
import { GetExpenseQueryHandler } from "./queries/GetExpenseQueryHandler";
import { EditExpenseCommandHandler } from "./commands/EditExpenseCommandHandler";
import { RemoveExpenseCommandHandler } from "./commands/RemoveExpenseCommandHandler";
import { AddExpenseTagCommandHandler } from "./commands/AddExpenseTagCommandHandler";
import { RemoveExpenseTagCommandHandler } from "./commands/RemoveExpenseTagCommandHandler";

export class EditExpensePage extends Page<IEditExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    public readonly route: string = "/expenses/:month(\\d{4}-\\d{2})/:id";

    public readonly handlers: [QueryHandlerConfiguration<IEditExpenseRouteParams, IExpenseFormViewOptions>, ...ICommandHandlerDefinition<IEditExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions>[]] = [
        GetExpenseQueryHandler,
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