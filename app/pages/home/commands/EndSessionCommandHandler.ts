import type { IHomeRouteParams, IHomeViewOptions } from "../HomePageDefinition";
import type { PageRequestBody } from "../../page/IBasePageRequestBody";
import type { IRequestResult } from "../../page/results";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { IAzureActiveDirectoryAuthenticationFormBody } from "../../../services/AzureActiveDirectory/AzureActiveDirectorySessionService";
import type { ISessionService } from "../../../services/ISessionService";
import { CommandHandler } from "../../page";

export class EndSessionCommandHandler extends CommandHandler<IHomeRouteParams, PageRequestBody<IAzureActiveDirectoryAuthenticationFormBody>, IHomeViewOptions> {
    private readonly _sessionService: ISessionService;

    public constructor({ sessionService }: IDependencyContainer) {
        super();
        this._sessionService = sessionService;
    }

    public async executeCommandAsync(routeParams: IHomeRouteParams, { code, state }: PageRequestBody<IAzureActiveDirectoryAuthenticationFormBody>, queryParmas: {}): Promise<IRequestResult> {
        await this._sessionService.endSessionAsync();
        return this.redirect(await this._sessionService.getSignOutUrlAsync());
    }
}