import type { IHomeRouteParams, IHomeViewOptions } from "../HomePageDefinition";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { IRequestResult } from "../../page/results";
import type { IAzureActiveDirectoryAuthenticationFormBody } from "../../../services/AzureActiveDirectory/AzureActiveDirectorySessionService";
import type { ISessionService } from "../../../services/ISessionService";
import { CommandHandler } from "../../page";
import { PageRequestBody } from "../../page/IBasePageRequestBody";

export class BeginSessionCommandHandler extends CommandHandler<IHomeRouteParams, PageRequestBody<IAzureActiveDirectoryAuthenticationFormBody>, IHomeViewOptions> {
    private readonly _sessionService: ISessionService;

    public constructor({ sessionService }: IDependencyContainer) {
        super();
        this._sessionService = sessionService;
    }

    public async executeCommandAsync(routeParams: IHomeRouteParams, { code, state }: PageRequestBody<IAzureActiveDirectoryAuthenticationFormBody>, queryParmas: {}): Promise<IRequestResult> {
        await this._sessionService.beginSessionAsync(code);
        return this.redirect(state);
    }
}