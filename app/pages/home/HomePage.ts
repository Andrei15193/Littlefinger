import type { ICommandHandlerDefinition, QueryHandlerType } from "../page";
import type { IHomeRouteParams, IHomeViewOptions } from "./HomePageDefinition";
import { Page } from "../page";
import { GetHomePageQueryHandler } from "./queries/GetHomePageQueryHandler";

export class HomePage extends Page<IHomeRouteParams, never, IHomeViewOptions> {
    public readonly route: string = "/";

    public handlers: [QueryHandlerType<IHomeRouteParams, IHomeViewOptions>, ...ICommandHandlerDefinition<IHomeRouteParams, never, IHomeViewOptions>[]] = [
        GetHomePageQueryHandler
    ];
}