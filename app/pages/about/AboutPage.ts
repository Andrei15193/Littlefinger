import type { ICommandHandlerDefinition, QueryHandlerType } from "../page";
import type { IAboutRouteParams, IAboutViewOptions } from "./AboutPageDefinition";
import { Page } from "../page";
import { GetAboutPageQueryHandler } from "./queries/GetAboutPageQueryHandler";

export class AboutPage extends Page<IAboutRouteParams, never, IAboutViewOptions> {
    public readonly route: string = "/about";

    public handlers: [QueryHandlerType<IAboutRouteParams, IAboutViewOptions>, ...ICommandHandlerDefinition<IAboutRouteParams, never, IAboutViewOptions>[]] = [
        GetAboutPageQueryHandler
    ];
}