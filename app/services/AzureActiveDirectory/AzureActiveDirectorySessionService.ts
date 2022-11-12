import type { Configuration, AuthorizationUrlRequest } from "@azure/msal-node";
import type { ISessionService } from "../ISessionService";
import type { IUser, IUserSession, IUserSessionData } from "../../model/Users";
import type { IUserSessionsRepository } from "../../data/repositories/users/IUserSessionsRepository";
import { ConfidentialClientApplication, LogLevel, ResponseMode, InteractionRequiredAuthError } from "@azure/msal-node";
import { v4 as uuid } from "uuid";
import { DataStorageError } from "../../data/DataStorageError";
import { config } from "../../config";

export interface IAzureActiveDirectoryAuthenticationFormBody {
    readonly client_info: string;
    readonly code: string;
    readonly state: string;
}

export class AzureActiveDirectorySessionService implements ISessionService {
    private _userSession: IUserSession | null;
    private _sessionUpdated: boolean;
    private readonly _userSessionsRepository: IUserSessionsRepository;

    public constructor(userSessionsRepository: IUserSessionsRepository) {
        this._userSession = null;
        this._sessionUpdated = false;
        this._userSessionsRepository = userSessionsRepository;
    }

    public get session(): IUserSession | null {
        return this._userSession;
    }

    public get sessionUpdated(): boolean {
        return this._sessionUpdated;
    }

    public async getSignInUrlAsync(originalUrl: string): Promise<string> {
        const confidentialClientApplication = new ConfidentialClientApplication(confidentialClientApplicationConfig);

        return await confidentialClientApplication.getAuthCodeUrl({
            ...authorizationRequest,
            state: originalUrl
        });
    }

    public getSignOutUrlAsync(): Promise<string> {
        return Promise.resolve(logoutUrl);
    }

    public async beginSessionAsync(authenticationCode: string): Promise<void> {
        const confidentialClientApplication = new ConfidentialClientApplication(confidentialClientApplicationConfig);
        const token = await confidentialClientApplication.acquireTokenByCode({
            code: authenticationCode,
            scopes: authorizationRequest.scopes,
            authority: authorizationRequest.authority,
            redirectUri: authorizationRequest.redirectUri
        });

        const { oid: userId, name: userDisplayName } = token.idTokenClaims as IAzureActiveDirectoryClaims;
        const user: IUser = {
            id: userId,
            displayName: userDisplayName,
            defaultCurrency: "RON",
        };

        const sessionId = uuid();
        const sessionExpiration = this._getTokenExpiration();

        this._userSessionsRepository.addAsync({
            sessionId,
            expiration: sessionExpiration,
            user,
            serializedMsalTokenCache: confidentialClientApplication.getTokenCache().serialize()
        })

        this._userSession = {
            id: sessionId,
            user,
            expiration: sessionExpiration
        };
        this._sessionUpdated = true;
    }

    public async tryLoadSessionAsync(userId: string | undefined, sessionId: string | undefined): Promise<boolean> {
        if (userId === undefined || userId === null || sessionId === undefined || sessionId === null)
            return false;

        try {
            const userSessionData = await this._userSessionsRepository.getAsync(userId, sessionId);

            let updatedUserSessionData = userSessionData.expiration < new Date()
                ? await this._tryRefreshSessionData(userSessionData)
                : userSessionData;

            this._sessionUpdated = userSessionData !== updatedUserSessionData;
            if (updatedUserSessionData !== null) {
                await this._userSessionsRepository.updateAsync(updatedUserSessionData);
                this._userSession = {
                    id: sessionId,
                    user: userSessionData.user,
                    expiration: userSessionData.expiration
                };

                return true;
            }
            else
                return false;
        }
        catch (error) {
            if (error instanceof InteractionRequiredAuthError || (error instanceof DataStorageError && error.reason === "NotFound"))
                return false;
            else
                throw error;
        }
    }

    public async endSessionAsync(): Promise<void> {
        if (this._userSession !== null) {
            await this._userSessionsRepository.removeAsync(this._userSession.user.id, this._userSession.id);
            this._userSession = null;
            this._sessionUpdated = true;
        }
    }

    private async _tryRefreshSessionData(userSessionData: IUserSessionData): Promise<IUserSessionData | null> {
        console.log(`Reaquiring access token for ${userSessionData.user.id}`);

        const confidentialClientApplication = new ConfidentialClientApplication(confidentialClientApplicationConfig);
        const tokenCache = confidentialClientApplication.getTokenCache();
        tokenCache.deserialize(userSessionData.serializedMsalTokenCache);

        const userAccount = await tokenCache.getAccountByLocalId(userSessionData.user.id);
        if (userAccount === undefined || userAccount === null)
            return null;

        const token = await confidentialClientApplication.acquireTokenSilent({
            account: userAccount,
            scopes: authorizationRequest.scopes,
            forceRefresh: true
        });
        if (token === undefined || token === null)
            return null;

        const newSessionExpiration = new Date();
        newSessionExpiration.setMinutes(newSessionExpiration.getMinutes() + config.azureActiveDirecotry.tokenLifeInMinutes - 15);
        return {
            sessionId: userSessionData.sessionId,
            user: userSessionData.user,
            expiration: this._getTokenExpiration(),
            serializedMsalTokenCache: tokenCache.serialize()
        };
    }

    private _getTokenExpiration(): Date {
        const sessionExpiration = new Date();
        sessionExpiration.setMinutes(sessionExpiration.getMinutes() + config.azureActiveDirecotry.tokenLifeInMinutes - 15);
        return sessionExpiration;
    }
}

interface IAzureActiveDirectoryClaims {
    readonly exp: number,
    readonly nbf: number,
    readonly ver: string,
    readonly iss: string,
    readonly sub: string,
    readonly aud: string,
    readonly iat: number,
    readonly auth_time: number,
    readonly oid: string,
    readonly name: string,
    readonly emails: readonly string[],
    readonly tfp: string
}

const confidentialClientApplicationConfig: Configuration = {
    auth: {
        clientId: config.azureActiveDirecotry.clientId,
        clientSecret: config.azureActiveDirecotry.clientSecret,
        authority: `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com/${config.azureActiveDirecotry.tenantName}.onmicrosoft.com/${config.azureActiveDirecotry.authenticationFlowName}`,
        knownAuthorities: [
            `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com`
        ]
    },
    system: {
        loggerOptions: {
            loggerCallback(logLevel: LogLevel, message: string) {
                switch (logLevel) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                    case LogLevel.Info:
                        console.info(message);
                        break;
                    case LogLevel.Verbose:
                        console.log(message);
                        break;
                    case LogLevel.Trace:
                        console.trace(message);
                        break;
                }
            },
            piiLoggingEnabled: false,
            logLevel: LogLevel.Verbose
        }
    }
};

const authorizationRequest: AuthorizationUrlRequest = {
    redirectUri: config.azureActiveDirecotry.returnUrl,
    authority: `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com/${config.azureActiveDirecotry.tenantName}.onmicrosoft.com/${config.azureActiveDirecotry.authenticationFlowName}`,
    scopes: [],
    responseMode: ResponseMode.FORM_POST,
    maxAge: (config.azureActiveDirecotry.tokenLifeInMinutes * 60)
};

const logoutUrl = `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com/${config.azureActiveDirecotry.tenantName}.onmicrosoft.com/${config.azureActiveDirecotry.authenticationFlowName}/oauth2/v2.0/logout?post_logout_redirect_uri=${config.azureActiveDirecotry.returnUrl}`