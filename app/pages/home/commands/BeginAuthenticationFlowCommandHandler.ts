import type { IAuthenticationFormBody, IHomeRouteParams } from "../HomePageDefinition";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { IRequestResult } from "../../page/results";
import type { ISessionService } from "../../../services/ISessionService";
import { BasicCommandHandler } from "../../page";

export class BeginAuthenticationFlowCommandHandler extends BasicCommandHandler<IHomeRouteParams, IAuthenticationFormBody> {
    private readonly _sessionService: ISessionService;

    public constructor({ sessionService }: IDependencyContainer) {
        super();
        this._sessionService = sessionService;
    }

    public async executeCommandAsync(routeParams: IHomeRouteParams, body: IAuthenticationFormBody, queryParmas: {}): Promise<IRequestResult> {
        return this.redirect(this._sessionService.getSignInUrl("/"));
    }
}