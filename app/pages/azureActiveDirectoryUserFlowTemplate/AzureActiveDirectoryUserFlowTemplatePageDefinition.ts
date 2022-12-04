export interface IAzureActiveDirectoryUserFlowTemplateRouteParams {
    readonly locale: string;
    readonly userFlow: "signUp" | "signIn" | "passwordReset";
}