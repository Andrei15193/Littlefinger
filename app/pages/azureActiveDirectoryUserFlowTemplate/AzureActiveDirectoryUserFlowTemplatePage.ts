import type { IBasicQueryHandlerDefinition } from "../page";
import type { IAzureActiveDirectoryUserFlowTemplateRouteParams } from "./AzureActiveDirectoryUserFlowTemplatePageDefinition";
import { BasicPage } from "../page";
import { GetAzureActiveDirectoryUserFlowTemplateQueryHandler } from "./queries/GetAzureActiveDirectoryUserFlowTemplateQueryHandler";

export class AzureActiveDirectoryUserFlowTemplatePage extends BasicPage<IAzureActiveDirectoryUserFlowTemplateRouteParams> {
    public readonly route: string = "/:locale/:userFlow/azureActiveDirectoryUserFlowTemplate";

    public handlers: [IBasicQueryHandlerDefinition<IAzureActiveDirectoryUserFlowTemplateRouteParams>] = [
        {
            allowAnonymousRequests: true,
            handlerType: GetAzureActiveDirectoryUserFlowTemplateQueryHandler
        }
    ];
}