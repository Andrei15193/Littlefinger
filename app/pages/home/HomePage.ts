import type { IBaseViewOptions, ICommandHandlerDefinition, QueryHandlerConfiguration } from "../page";
import type { IAuthenticationFormBody, IHomeRouteParams } from "./HomePageDefinition";
import type { PageRequestBody } from "../page/IBasePageRequestBody";
import { Page } from "../page";
import { GetHomePageQueryHandler } from "./queries/GetHomePageQueryHandler";
import { BeginSignUpFlowCommandHandler } from "./commands/BeginSignUpFlowCommandHandler";
import { BeginAuthenticationFlowCommandHandler } from "./commands/BeginAuthenticationFlowCommandHandler";
import { BeginSessionCommandHandler } from "./commands/BeginSessionCommandHandler";
import { EndSessionCommandHandler } from "./commands/EndSessionCommandHandler";

export class HomePage extends Page<IHomeRouteParams, PageRequestBody<IAuthenticationFormBody>> {
    public readonly route: string = "/";

    public handlers: [QueryHandlerConfiguration<IHomeRouteParams, IBaseViewOptions>, ...ICommandHandlerDefinition<IHomeRouteParams, PageRequestBody<IAuthenticationFormBody>, IBaseViewOptions>[]] = [
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