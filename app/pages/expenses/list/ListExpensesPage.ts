import type { IBasePageRequestBody, IBasicQueryHandlerDefinition } from "../../page";
import type { IListExpensesRouteParams, IListExpensesViewOptions } from "./ListExpensesPageDefinition";
import { BasicPage } from "../../page";
import { GetMonthlyExpensesQueryHandler } from "./queries/GetMonthlyExpensesQueryHandler";

export class ListExpensesPage extends BasicPage<IListExpensesRouteParams, IBasePageRequestBody, IListExpensesViewOptions> {
    public readonly route: string = "/expenses/:month(\\d{4}-\\d{2})?";

    public readonly handlers: [IBasicQueryHandlerDefinition<IListExpensesRouteParams, IListExpensesViewOptions>] = [
        {
            handlerType: GetMonthlyExpensesQueryHandler
        }
    ];
}