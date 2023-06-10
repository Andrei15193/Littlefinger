import type { IBasePageRequestBody, IBasicQueryHandlerDefinition } from "../../page";
import type { IListExpenseTemplatesRouteParams, IListExpenseTemplatesViewOptions } from "./ListExpenseTemplatesPageDefinition";
import { BasicPage } from "../../page";
import { GetExpenseTemplatesQueryHandler } from "./queries/GetExpenseTemplatesQueryHandler";

export class ListExpenseTemplatesPage extends BasicPage<IListExpenseTemplatesRouteParams, IBasePageRequestBody, IListExpenseTemplatesViewOptions> {
    public readonly route: string = "/expense-templates";

    public readonly handlers: [IBasicQueryHandlerDefinition<IListExpenseTemplatesRouteParams, IListExpenseTemplatesViewOptions>] = [
        {
            handlerType: GetExpenseTemplatesQueryHandler
        }
    ];
}