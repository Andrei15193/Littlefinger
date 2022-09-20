import type { IDependencyContainer } from "../../../dependencyContainer";
import type { ITranslation } from "../../../translations/translation";
import type { IAboutRouteParams, IAboutViewOptions } from "../AboutPageDefinition";
import type { IRequestResult } from "../../page/results";
import { QueryHandler } from "../../page";

export class GetAboutPageQueryHandler extends QueryHandler<IAboutRouteParams, IAboutViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public executeQueryAsync(routeParams: IAboutRouteParams, queryParmas: {}): Promise<IRequestResult> {
        return Promise.resolve(this.render("about", {
            title: this._translation.about.title,
            tab: "about"
        }));
    }
}