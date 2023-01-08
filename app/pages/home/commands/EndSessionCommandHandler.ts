import type { IAuthenticationFormBody, IHomeRouteParams } from "../HomePageDefinition";
import type { IRequestResult } from "../../page/results";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { ISessionService } from "../../../services/ISessionService";
import { BasicCommandHandler } from "../../page";

export class EndSessionCommandHandler extends BasicCommandHandler<IHomeRouteParams, IAuthenticationFormBody> {
    private readonly _sessionService: ISessionService;

    public constructor({ sessionService }: IDependencyContainer) {
        super();
        this._sessionService = sessionService;
    }

    public async executeCommandAsync(routeParams: IHomeRouteParams, body: IAuthenticationFormBody, queryParmas: {}): Promise<IRequestResult> {
        const logoutUrl = this._sessionService.getSignOutUrl();
        await this._sessionService.endSessionAsync();
        return this.redirect(logoutUrl);
    }
}