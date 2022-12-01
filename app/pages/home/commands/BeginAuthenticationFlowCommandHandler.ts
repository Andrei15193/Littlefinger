import type { IAuthenticationFormBody, IHomeRouteParams } from "../HomePageDefinition";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { IRequestResult } from "../../page/results";
import type { ISessionService } from "../../../services/ISessionService";
import { CommandHandler } from "../../page";
import { PageRequestBody } from "../../page/IBasePageRequestBody";

export class BeginAuthenticationFlowCommandHandler extends CommandHandler<IHomeRouteParams, PageRequestBody<IAuthenticationFormBody>> {
    private readonly _sessionService: ISessionService;

    public constructor({ sessionService }: IDependencyContainer) {
        super();
        this._sessionService = sessionService;
    }

    public async executeCommandAsync(routeParams: IHomeRouteParams, body: PageRequestBody<IAuthenticationFormBody>, queryParmas: {}): Promise<IRequestResult> {
        return this.redirect(this._sessionService.getSignInUrl("/"));
    }
}