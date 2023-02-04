import type { FormType, IFormCommandHandlerDefinition, IFormQueryHandlerDefinition } from "../../page";
import type { IListExpenseShopsRouteParams, IListExpenseShopsViewOptions, IModifyExpenseShopsRequestBody } from "./ListExpenseShopsPageDefinition";
import { FormPage } from "../../page";
import { ExpenseShopForm } from "../ExpenseShopForm";
import { GetExpenseShopsQueryHandler } from "./queries/GetExpenseShopsQueryHandler";
import { RenameExpenseShopCommandHandler } from "./commands/RenameExpenseShopCommandHandler";
import { RemoveExpenseShopCommandHandler } from "./commands/RemoveExpenseShopCommandHandler";

export class ListExpenseShopsPage extends FormPage<ExpenseShopForm, IListExpenseShopsRouteParams, IModifyExpenseShopsRequestBody, IListExpenseShopsViewOptions> {
    public readonly route: string = "/expense-shops";

    public readonly formType: FormType<ExpenseShopForm> = ExpenseShopForm;

    public readonly handlers: [IFormQueryHandlerDefinition<ExpenseShopForm, IListExpenseShopsRouteParams, IListExpenseShopsViewOptions>, ...IFormCommandHandlerDefinition<ExpenseShopForm, IListExpenseShopsRouteParams, IModifyExpenseShopsRequestBody, IListExpenseShopsViewOptions>[]] = [
        {
            handlerType: GetExpenseShopsQueryHandler
        },
        {
            name: "rename",
            handlerType: RenameExpenseShopCommandHandler
        },
        {
            name: "remove",
            handlerType: RemoveExpenseShopCommandHandler
        }
    ];
}