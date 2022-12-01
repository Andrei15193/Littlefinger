import type { IAuthenticationFormBody, IHomeRouteParams } from "../HomePageDefinition";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { IRequestResult } from "../../page/results";
import type { ISessionService } from "../../../services/ISessionService";
import { CommandHandler } from "../../page";
import { PageRequestBody } from "../../page/IBasePageRequestBody";
import { AuthenticationFormBodyHelper } from "../HomePageDefinition";

export class BeginSessionCommandHandler extends CommandHandler<IHomeRouteParams, PageRequestBody<IAuthenticationFormBody>> {
    private readonly _sessionService: ISessionService;

    public constructor({ sessionService }: IDependencyContainer) {
        super();
        this._sessionService = sessionService;
    }

    public async executeCommandAsync(routeParams: IHomeRouteParams, body: PageRequestBody<IAuthenticationFormBody>, queryParmas: {}): Promise<IRequestResult> {
        const originalUrl = this._sessionService.getOriginalUrl(body.state);

        if (AuthenticationFormBodyHelper.isSuccessful(body)) {
            await this._sessionService.beginSessionAsync(body.code, body.state);
            return this.redirect(originalUrl);
        }
        else {
            const errorCode = body.error_description.split(':', 2)[0]?.toUpperCase();
            switch (errorCode) {
                case "AADB2C90118":
                    return this.redirect(this._sessionService.getPasswordResetUrl(originalUrl));

                case "AADB2C90091":
                case "AADB2C99002":
                    return this.redirect(originalUrl);

                default:
                    console.log(`Unhandled Azure Active Directory error code ${errorCode}`);
                    return this.redirect(originalUrl);
            }
        }
    }
}