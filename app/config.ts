import { Enum } from "./global/Enum";

export interface IApplicationConfiguration {
    readonly absolutePublicPathRoot: string;

    readonly http: {
        readonly port: number;
        readonly cookieSecret: string;
    };

    readonly environment: null | {
        readonly name: string;
        readonly type: EnvironmentType;
    };

    readonly azureActiveDirecotry: {
        readonly tenantName: string;
        readonly clientId: string;
        readonly clientSecret: string;
        readonly signUpFlowName: string;
        readonly signInOrSignUpFlowName: string;
        readonly passwordResetFlowName: string;
        readonly returnUrl: string;
        readonly tokenLifeInMinutes: number;
    };

    readonly connectionStrings: {
        readonly azureStorage: string;
    };
};

export enum EnvironmentType {
    Release,
    Test,
    Development
}

class ApplicationConfiguration implements IApplicationConfiguration {
    public constructor() {
        this.absolutePublicPathRoot = process.env.APPSETTING_ABSOLUTE_PUBLIC_PATH_ROOT!;

        this.http = {
            port: Number(process.env.PORT!),
            cookieSecret: process.env.APPSETTING_HTTP_COOKIE_SECRET!
        };

        this.azureActiveDirecotry = {
            tenantName: process.env.APPSETTING_AZURE_AD_TENANT_NAME!,
            clientId: process.env.APPSETTING_AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.APPSETTING_AZURE_AD_CLIENT_SECRET!,
            signUpFlowName: process.env.APPSETTING_AZURE_AD_SIGNUP_FLOW_NAME!,
            signInOrSignUpFlowName: process.env.APPSETTING_AZURE_AD_SIGNIN_OR_SIGNUP_FLOW_NAME!,
            passwordResetFlowName: process.env.APPSETTING_AZURE_AD_PASSWORD_RESET_FLOW_NAME!,
            returnUrl: process.env.APPSETTING_AZURE_AD_RETURN_URL!,
            tokenLifeInMinutes: Number(process.env.APPSETTING_AZURE_AD_TOKEN_LIFE_MINUTES!)
        };

        this.connectionStrings = {
            azureStorage: process.env.CUSTOMCONNSTR_AZURE_STORAGE!
        };

        if (process.env.APPSETTING_ENVIRONMENT_NAME !== undefined && process.env.APPSETTING_ENVIRONMENT_NAME !== null && process.env.APPSETTING_ENVIRONMENT_NAME.length > 0
            && process.env.APPSETTING_ENVIRONMENT_TYPE !== undefined && process.env.APPSETTING_ENVIRONMENT_TYPE !== null && Enum.hasKey(EnvironmentType, process.env.APPSETTING_ENVIRONMENT_TYPE)) {
            const environmentType = Enum.getValue(EnvironmentType, process.env.APPSETTING_ENVIRONMENT_TYPE);
            this.environment = environmentType === EnvironmentType.Release
                ? null
                : {
                    name: process.env.APPSETTING_ENVIRONMENT_NAME,
                    type: environmentType
                };
        }
        else
            this.environment = null;
    }

    public readonly absolutePublicPathRoot: string;
    public readonly http: IApplicationConfiguration["http"];
    public readonly environment: IApplicationConfiguration["environment"];
    public readonly azureActiveDirecotry: IApplicationConfiguration["azureActiveDirecotry"];
    public readonly connectionStrings: IApplicationConfiguration["connectionStrings"];
}

export const config: IApplicationConfiguration = new ApplicationConfiguration();