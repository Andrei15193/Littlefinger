import type { FormType, IFormCommandHandlerDefinition, IFormQueryHandlerDefinition } from "../../page";
import type { IListExpenseTagsRouteParams, IListExpenseTagsViewOptions, IModifyExpenseTagsRequestBody } from "./ListExpenseTagsPageDefinition";
import { FormPage } from "../../page";
import { ExpenseTagForm } from "../ExpenseTagForm";
import { GetExpenseTagsQueryHandler } from "./queries/GetExpenseTagsQueryHandler";
import { EditExpenseTagCommandHandler } from "./commands/EditExpenseTagCommandHandler";
import { RemoveExpenseTagCommandHandler } from "./commands/RemoveExpenseTagCommandHandler";

export class ListExpenseTagsPage extends FormPage<ExpenseTagForm, IListExpenseTagsRouteParams, IModifyExpenseTagsRequestBody, IListExpenseTagsViewOptions> {
    public readonly route: string = "/expense-tags";

    public readonly formType: FormType<ExpenseTagForm> = ExpenseTagForm;

    public readonly handlers: [IFormQueryHandlerDefinition<ExpenseTagForm, IListExpenseTagsRouteParams, IListExpenseTagsViewOptions>, ...IFormCommandHandlerDefinition<ExpenseTagForm, IListExpenseTagsRouteParams, IModifyExpenseTagsRequestBody, IListExpenseTagsViewOptions>[]] = [
        {
            handlerType: GetExpenseTagsQueryHandler
        },
        {
            name: "edit",
            handlerType: EditExpenseTagCommandHandler
        },
        {
            name: "remove",
            handlerType: RemoveExpenseTagCommandHandler
        }
    ];
}