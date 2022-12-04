import type { IAzureActiveDirectoryUserFlowTemplateRouteParams } from "../AzureActiveDirectoryUserFlowTemplatePageDefinition";
import type { IRequestResult } from "../../page/results/index";
import { QueryHandler } from "../../page/index";
import { TranslationResolver } from "../../../translations/TranslationResolver";

export class GetAzureActiveDirectoryUserFlowTemplateQueryHandler extends QueryHandler<IAzureActiveDirectoryUserFlowTemplateRouteParams> {
    public constructor() {
        super();
    }

    public executeQueryAsync({ locale }: IAzureActiveDirectoryUserFlowTemplateRouteParams, queryParmas: {}): Promise<IRequestResult> {
        const translation = TranslationResolver.resolve(locale);

        return Promise.resolve(this.render("azureActiveDirectoryUserFlowTemplate", {
            title: translation.about.title,
            tab: "about",
            translation: translation,
            absolutePublicPath: true
        }));
    }
}