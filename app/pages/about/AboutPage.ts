import type { IBasicQueryHandlerDefinition } from "../page";
import type { IAboutRouteParams } from "./AboutPageDefinition";
import { BasicPage } from "../page";
import { GetAboutPageQueryHandler } from "./queries/GetAboutPageQueryHandler";

export class AboutPage extends BasicPage<IAboutRouteParams> {
    public readonly route: string = "/about";

    public handlers: [IBasicQueryHandlerDefinition<IAboutRouteParams>] = [
        {
            handlerType: GetAboutPageQueryHandler
        }
    ];
}