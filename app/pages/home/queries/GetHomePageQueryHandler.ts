import type { IDependencyContainer } from "../../../dependencyContainer";
import type { ITranslation } from "../../../translations/Translation";
import type { IHomeRouteParams, IHomeViewOptions } from "../HomePageDefinition";
import type { IRequestResult } from "../../page/results";
import type { ISessionService } from "../../../services/ISessionService";
import { QueryHandler } from "../../page";

export class GetHomePageQueryHandler extends QueryHandler<IHomeRouteParams, IHomeViewOptions> {
    private static _signInUrl: string | null = null;

    private readonly _translation: ITranslation;
    private readonly _sessionService: ISessionService;

    public constructor({ translation, sessionService }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._sessionService = sessionService;
    }

    public async executeQueryAsync(routeParams: IHomeRouteParams, queryParmas: {}): Promise<IRequestResult> {
        if (GetHomePageQueryHandler._signInUrl === null)
            GetHomePageQueryHandler._signInUrl = await this._sessionService.getSignInUrlAsync("/");

        return this.render("index", {
            title: this._translation.home.title,
            tab: "home",
            signInUrl: GetHomePageQueryHandler._signInUrl
        });
    }
}