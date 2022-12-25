import type { IBaseViewOptions, ICommandHandlerDefinition, IQueryHandlerDefinition } from "../page";
import type { IAboutRouteParams } from "./AboutPageDefinition";
import { Page } from "../page";
import { GetAboutPageQueryHandler } from "./queries/GetAboutPageQueryHandler";

export class AboutPage extends Page<IAboutRouteParams, never> {
    public readonly route: string = "/about";

    public handlers: [IQueryHandlerDefinition<IAboutRouteParams, IBaseViewOptions>, ...ICommandHandlerDefinition<IAboutRouteParams, never, IBaseViewOptions>[]] = [
        {
            handlerType: GetAboutPageQueryHandler
        }
    ];
}