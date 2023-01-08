import type { IDependencyContainer } from "../../../dependencyContainer";
import type { ITranslation } from "../../../translations/Translation";
import type { IAboutRouteParams } from "../AboutPageDefinition";
import type { IRequestResult } from "../../page/results";
import { BasicQueryHandler } from "../../page";

export class GetAboutPageQueryHandler extends BasicQueryHandler<IAboutRouteParams> {
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