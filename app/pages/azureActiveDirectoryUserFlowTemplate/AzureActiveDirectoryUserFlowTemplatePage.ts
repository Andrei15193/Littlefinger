import type { IBaseViewOptions, ICommandHandlerDefinition, QueryHandlerConfiguration } from "../page/index";
import type { IAzureActiveDirectoryUserFlowTemplateRouteParams } from "./AzureActiveDirectoryUserFlowTemplatePageDefinition";
import { Page } from "../page/index";
import { GetAzureActiveDirectoryUserFlowTemplateQueryHandler } from "./queries/GetAzureActiveDirectoryUserFlowTemplateQueryHandler";

export class AzureActiveDirectoryUserFlowTemplatePage extends Page<IAzureActiveDirectoryUserFlowTemplateRouteParams, never, IBaseViewOptions> {
    public readonly route: string = "/:locale/:userFlow/azureActiveDirectoryUserFlowTemplate";

    public handlers: [QueryHandlerConfiguration<IAzureActiveDirectoryUserFlowTemplateRouteParams, IBaseViewOptions>, ...ICommandHandlerDefinition<IAzureActiveDirectoryUserFlowTemplateRouteParams, never, IBaseViewOptions>[]] = [
        {
            allowAnonymousRequests: true,
            handlerType: GetAzureActiveDirectoryUserFlowTemplateQueryHandler
        }
    ];
}