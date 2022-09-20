import type { IDependencyContainer } from "../../../dependencyContainer";
import type { ITranslation } from "../../../translations/translation";
import type { IHomeRouteParams, IHomeViewOptions } from "../HomePageDefinition";
import type { IRequestResult } from "../../page/results";
import { QueryHandler } from "../../page";

export class GetHomePageQueryHandler extends QueryHandler<IHomeRouteParams, IHomeViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public executeQueryAsync(routeParams: IHomeRouteParams, queryParmas: {}): Promise<IRequestResult> {
        return Promise.resolve(this.render("index", {
            title: this._translation.home.title,
            tab: "home"
        }));
    }
}