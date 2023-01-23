import type { IBasicCommandHandlerDefinition, IBasicQueryHandlerDefinition } from "../../page";
import type { IListExpenseShopsRouteParams, IListExpenseShopsViewOptions, IModifyExpenseShopsRequestBody } from "./ListExpenseShopsPageDefinition";
import { BasicPage } from "../../page";
import { GetExpenseShopsQueryHandler } from "./queries/GetExpenseShopsQueryHandler";
import { RemoveExpenseShopCommandHandler } from "./commands/RemoveExpenseShopCommandHandler";

export class ListExpenseShopsPage extends BasicPage<IListExpenseShopsRouteParams, IModifyExpenseShopsRequestBody, IListExpenseShopsViewOptions> {
    public readonly route: string = "/expense-shops";

    public readonly handlers: [IBasicQueryHandlerDefinition<IListExpenseShopsRouteParams, IListExpenseShopsViewOptions>, ...IBasicCommandHandlerDefinition<IListExpenseShopsRouteParams, IModifyExpenseShopsRequestBody, IListExpenseShopsViewOptions>[]] = [
        {
            handlerType: GetExpenseShopsQueryHandler
        },
        {
            name: "remove",
            handlerType: RemoveExpenseShopCommandHandler
        }
    ];
}