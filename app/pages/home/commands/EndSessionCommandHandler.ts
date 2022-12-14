import type { IAuthenticationFormBody, IHomeRouteParams } from "../HomePageDefinition";
import type { PageRequestBody } from "../../page/IBasePageRequestBody";
import type { IRequestResult } from "../../page/results";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { ISessionService } from "../../../services/ISessionService";
import { CommandHandler } from "../../page";

export class EndSessionCommandHandler extends CommandHandler<IHomeRouteParams, PageRequestBody<IAuthenticationFormBody>> {
    private readonly _sessionService: ISessionService;

    public constructor({ sessionService }: IDependencyContainer) {
        super();
        this._sessionService = sessionService;
    }

    public async executeCommandAsync(routeParams: IHomeRouteParams, body: PageRequestBody<IAuthenticationFormBody>, queryParmas: {}): Promise<IRequestResult> {
        const logoutUrl = this._sessionService.getSignOutUrl();
        await this._sessionService.endSessionAsync();
        return this.redirect(logoutUrl);
    }
}