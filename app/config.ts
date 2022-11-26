export const config: IApplicationConfiguration = {
    http: {
        port: Number(process.env.PORT!),
        cookieSecret: process.env.APPSETTING_HTTP_COOKIE_SECRET!
    },

    azureActiveDirecotry: {
        tenantName: process.env.APPSETTING_AZURE_AD_TENANT_NAME!,
        clientId: process.env.APPSETTING_AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.APPSETTING_AZURE_AD_CLIENT_SECRET!,
        authenticationFlowName: process.env.APPSETTING_AZURE_AD_AUTHENTICATION_FLOW_NAME!,
        passwordResetFlowName: process.env.APPSETTING_AZURE_AD_PASSWORD_RESET_FLOW_NAME!,
        returnUrl: process.env.APPSETTING_AZURE_AD_RETURN_URL!,
        tokenLifeInMinutes: Number(process.env.APPSETTING_AZURE_AD_TOKEN_LIFE_MINUTES!)
    },

    connectionStrings: {
        azureStorage: process.env.CUSTOMCONNSTR_AZURE_STORAGE!
    }
};

export interface IApplicationConfiguration {
    readonly http: {
        readonly port: number;
        readonly cookieSecret: string;
    };

    readonly azureActiveDirecotry: {
        readonly tenantName: string;
        readonly clientId: string;
        readonly clientSecret: string;
        readonly authenticationFlowName: string;
        readonly passwordResetFlowName: string;
        readonly returnUrl: string;
        readonly tokenLifeInMinutes: number;
    };

    readonly connectionStrings: {
        readonly azureStorage: string;
    };
};