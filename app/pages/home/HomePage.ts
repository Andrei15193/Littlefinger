import type { ICommandHandlerDefinition, QueryHandlerConfiguration } from "../page";
import type { IHomeRouteParams, IHomeViewOptions } from "./HomePageDefinition";
import { Page } from "../page";
import { GetHomePageQueryHandler } from "./queries/GetHomePageQueryHandler";
import { BeginSessionCommandHandler } from "./commands/BeginSessionCommandHandler";
import { EndSessionCommandHandler } from "./commands/EndSessionCommandHandler";

export class HomePage extends Page<IHomeRouteParams, never, IHomeViewOptions> {
    public readonly route: string = "/";

    public handlers: [QueryHandlerConfiguration<IHomeRouteParams, IHomeViewOptions>, ...ICommandHandlerDefinition<IHomeRouteParams, never, IHomeViewOptions>[]] = [
        {
            allowAnonymousRequests: true,
            handlerType: GetHomePageQueryHandler
        },
        {
            allowAnonymousRequests: true,
            name: "",
            handlerType: BeginSessionCommandHandler
        },
        {
            name: "end-session",
            handlerType: EndSessionCommandHandler
        }
    ];
}