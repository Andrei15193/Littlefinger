export const config: IApplicationConfiguration = {
    http: {
        cookieSecret: process.env.HTTP_COOKIE_SECRET!
    },

    azureActiveDirecotry: {
        tenantName: process.env.AZURE_AD_TENANT_NAME!,
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        authenticationFlowName: process.env.AZURE_AD_AUTHENTICATION_FLOW_NAME!,
        returnUrl: process.env.AZURE_AD_RETURN_URL!,
        tokenLifeInMinutes: Number(process.env.AZURE_AD_TOKEN_LIFE_MINUTES!)
    },

    connectionStrings: {
        azureStorage: process.env.CUSTOMCONNSTR_AZURE_STORAGE!
    }
};

export interface IApplicationConfiguration {
    readonly http: {
        readonly cookieSecret: string;
    };

    readonly azureActiveDirecotry: {
        readonly tenantName: string;
        readonly clientId: string;
        readonly clientSecret: string;
        readonly authenticationFlowName: string;
        readonly returnUrl: string;
        readonly tokenLifeInMinutes: number;
    };

    readonly connectionStrings: {
        readonly azureStorage: string;
    };
};