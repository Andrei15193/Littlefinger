import type { IListExpensesRouteParams, IListExpensesViewOptions } from "./ListExpensesPageDefinition";
import type { ICommandHandlerDefinition, QueryHandlerType } from "../../page";
import { Page } from "../../page";
import { GetMonthlyExpensesQueryHandler } from "./queries/GetMonthlyExpensesQueryHandler";

export class ListExpensesPage extends Page<IListExpensesRouteParams, never, IListExpensesViewOptions> {
    public readonly route: string = "/expenses/:month(\\d{4}-\\d{2})?";

    public readonly handlers: [QueryHandlerType<IListExpensesRouteParams, IListExpensesViewOptions>, ...ICommandHandlerDefinition<IListExpensesRouteParams, never, IListExpensesViewOptions>[]] = [
        GetMonthlyExpensesQueryHandler
    ];
}