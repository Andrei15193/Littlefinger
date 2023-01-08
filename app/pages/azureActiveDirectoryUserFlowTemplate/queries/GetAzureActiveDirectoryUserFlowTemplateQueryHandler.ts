import type { IAzureActiveDirectoryUserFlowTemplateRouteParams } from "../AzureActiveDirectoryUserFlowTemplatePageDefinition";
import type { IRequestResult } from "../../page/results/index";
import { BasicQueryHandler } from "../../page/index";
import { TranslationResolver } from "../../../translations/TranslationResolver";

export class GetAzureActiveDirectoryUserFlowTemplateQueryHandler extends BasicQueryHandler<IAzureActiveDirectoryUserFlowTemplateRouteParams> {
    public constructor() {
        super();
    }

    public executeQueryAsync({ locale, userFlow }: IAzureActiveDirectoryUserFlowTemplateRouteParams, queryParmas: {}): Promise<IRequestResult> {
        const translation = TranslationResolver.resolve(locale);

        let title: string;
        switch (userFlow) {
            case "signIn":
                title = translation.site.userFlowTitles.signIn;
                break;

            case "signUp":
                title = translation.site.userFlowTitles.signUp;
                break;

            case "passwordReset":
                title = translation.site.userFlowTitles.passwordReset;
                break;
        }

        return Promise.resolve(this.render("azureActiveDirectoryUserFlowTemplate", {
            title,
            tab: "about",
            translation: translation,
            absolutePublicPath: true
        }));
    }
}