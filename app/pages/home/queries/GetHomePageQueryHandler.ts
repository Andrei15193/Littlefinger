import type { IDependencyContainer } from "../../../dependencyContainer";
import type { ITranslation } from "../../../translations/Translation";
import type { IHomeRouteParams, IHomeViewOptions } from "../HomePageDefinition";
import type { IRequestResult } from "../../page/results";
import type { ISessionService } from "../../../services/ISessionService";
import { QueryHandler } from "../../page";

export class GetHomePageQueryHandler extends QueryHandler<IHomeRouteParams, IHomeViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _sessionService: ISessionService;

    public constructor({ translation, sessionService }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._sessionService = sessionService;
    }

    public async executeQueryAsync(routeParams: IHomeRouteParams, queryParmas: {}): Promise<IRequestResult> {
        return this.render("index", {
            title: this._translation.home.title,
            tab: "home",
            signInUrl: this._sessionService.getSignInUrl("/")
        });
    }
}