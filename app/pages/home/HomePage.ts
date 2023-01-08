import type { IBasicQueryHandlerDefinition, IBasicCommandHandlerDefinition } from "../page";
import type { IAuthenticationFormBody, IHomeRouteParams } from "./HomePageDefinition";
import { BasicPage } from "../page";
import { GetHomePageQueryHandler } from "./queries/GetHomePageQueryHandler";
import { BeginSignUpFlowCommandHandler } from "./commands/BeginSignUpFlowCommandHandler";
import { BeginAuthenticationFlowCommandHandler } from "./commands/BeginAuthenticationFlowCommandHandler";
import { BeginSessionCommandHandler } from "./commands/BeginSessionCommandHandler";
import { EndSessionCommandHandler } from "./commands/EndSessionCommandHandler";

export class HomePage extends BasicPage<IHomeRouteParams, IAuthenticationFormBody> {
    public readonly route: string = "/";

    public handlers: [IBasicQueryHandlerDefinition<IHomeRouteParams>, ...IBasicCommandHandlerDefinition<IHomeRouteParams, IAuthenticationFormBody>[]] = [
        {
            allowAnonymousRequests: true,
            handlerType: GetHomePageQueryHandler
        },
        {
            allowAnonymousRequests: true,
            name: "register",
            handlerType: BeginSignUpFlowCommandHandler
        },
        {
            allowAnonymousRequests: true,
            name: "authenticate",
            handlerType: BeginAuthenticationFlowCommandHandler
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