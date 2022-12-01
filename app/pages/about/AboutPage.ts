import type { ICommandHandlerDefinition, QueryHandlerConfiguration } from "../page";
import type { IAboutRouteParams, IAboutViewOptions } from "./AboutPageDefinition";
import { Page } from "../page";
import { GetAboutPageQueryHandler } from "./queries/GetAboutPageQueryHandler";

export class AboutPage extends Page<IAboutRouteParams, never, IAboutViewOptions> {
    public readonly route: string = "/about";

    public handlers: [QueryHandlerConfiguration<IAboutRouteParams, IAboutViewOptions>, ...ICommandHandlerDefinition<IAboutRouteParams, never, IAboutViewOptions>[]] = [
        GetAboutPageQueryHandler
    ];
}