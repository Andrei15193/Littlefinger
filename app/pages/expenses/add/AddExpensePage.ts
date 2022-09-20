import type { ICommandHandlerDefinition, QueryHandlerType } from "../../page";
import type { IExpenseFormViewOptions } from "../IExpenseFormViewOptions";
import type { IAddExpenseRouteParams } from "./AddExpensePageDefinition";
import type { PageRequestBody } from "../../page/IBasePageRequestBody";
import type { IExpenseFormData } from "../ExpenseForm";
import { Page } from "../../page";
import { GetBlankExpenseQueryHandler } from "./queries/GetBlankExpenseQueryHandler";
import { AddExpenseCommandHandler } from "./commands/AddExpenseCommandHandler";
import { AddExpenseTagCommandHandler } from "./commands/AddExpenseTagCommandHandler";
import { RemoveExpenseTagCommandHandler } from "./commands/RemoveExpenseTagCommandHandler";

export class AddExpensePage extends Page<IAddExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    public readonly route: string = "/expenses/:month(\\d{4}-\\d{2})?/add";

    public handlers: [QueryHandlerType<IAddExpenseRouteParams, IExpenseFormViewOptions>, ...ICommandHandlerDefinition<IAddExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions>[]] = [
        GetBlankExpenseQueryHandler,
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