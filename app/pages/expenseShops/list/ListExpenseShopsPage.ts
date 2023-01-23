import type { IBasePageRequestBody, IBasicQueryHandlerDefinition } from "../../page";
import type { IListExpenseShopsRouteParams, IListExpenseShopsViewOptions } from "./ListExpenseShopsPageDefinition";
import { BasicPage } from "../../page";
import { GetExpenseShopsQueryHandler } from "./queries/GetExpenseShopsQuery";

export class ListExpenseShopsPage extends BasicPage<IListExpenseShopsRouteParams, IBasePageRequestBody, IListExpenseShopsViewOptions> {
    public readonly route: string = "/expense-shops";

    public readonly handlers: [IBasicQueryHandlerDefinition<IListExpenseShopsRouteParams, IListExpenseShopsViewOptions>] = [
        {
            handlerType: GetExpenseShopsQueryHandler
        }
    ];
}