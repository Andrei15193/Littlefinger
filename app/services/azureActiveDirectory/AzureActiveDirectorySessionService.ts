import type { Configuration, AuthorizationUrlRequest } from "@azure/msal-node";
import type { ISessionService } from "../ISessionService";
import type { IUser, IUserSession, IUserSessionData } from "../../model/Users";
import type { IUserSessionsRepository } from "../../data/repositories/users/IUserSessionsRepository";
import { ConfidentialClientApplication, LogLevel, ResponseMode, InteractionRequiredAuthError } from "@azure/msal-node";
import { AuthenticationFlow } from "../ISessionService";
import { v4 as uuid } from "uuid";
import { DataStorageError } from "../../data/DataStorageError";
import { config } from "../../config";
import { Enum } from "../../global/Enum";

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

    public getSignInUrl(originalUrl: string): string {
        return this._getUserFlowUrl(AuthenticationFlow.Login, originalUrl);
    }

    public getPasswordResetUrl(originalUrl: string): string {
        return this._getUserFlowUrl(AuthenticationFlow.PasswordChange, originalUrl);
    }

    public getOriginalUrl(state: string): string {
        return this._deserializeState(state).originalUrl;
    }

    public getSignOutUrl(): string {
        return AzureActiveDirectorySessionService._getLogoutUrl(this.session!.authenticationFlow);
    }

    public async beginSessionAsync(authenticationCode: string, state: string): Promise<void> {
        const { authenticationFlow } = this._deserializeState(state);

        const confidentialClientApplication = new ConfidentialClientApplication(AzureActiveDirectorySessionService._getConfidentialClientApplicationConfig(authenticationFlow));
        const authorizationRequest = AzureActiveDirectorySessionService._getAuthorizationRequest(authenticationFlow);
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
            authenticationFlow,
            serializedMsalTokenCache: confidentialClientApplication.getTokenCache().serialize()
        })

        this._userSession = {
            id: sessionId,
            user,
            authenticationFlow,
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
                    authenticationFlow: userSessionData.authenticationFlow,
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

    private _deserializeState(state: string): IAuthenticationResponseState {
        const indexOfSeparator = state.indexOf('/');
        const authenticationFlowName = indexOfSeparator === -1 ? state : state.substring(0, indexOfSeparator);
        const originalUrl = indexOfSeparator === -1 || (indexOfSeparator + 1) === state.length ? "/" : state.substring(indexOfSeparator + 1);

        return {
            authenticationFlow: Enum.getValue(AuthenticationFlow, authenticationFlowName) || AuthenticationFlow.Login,
            originalUrl
        };
    }

    private _serializeState({ authenticationFlow, originalUrl }: IAuthenticationResponseState): string {
        return `${Enum.getKey(AuthenticationFlow, authenticationFlow)}/${originalUrl}`;
    }

    private async _tryRefreshSessionData(userSessionData: IUserSessionData): Promise<IUserSessionData | null> {
        const confidentialClientApplication = new ConfidentialClientApplication(AzureActiveDirectorySessionService._getConfidentialClientApplicationConfig(AuthenticationFlow.Login));
        const tokenCache = confidentialClientApplication.getTokenCache();
        tokenCache.deserialize(userSessionData.serializedMsalTokenCache);

        const userAccount = await tokenCache.getAccountByLocalId(userSessionData.user.id);
        if (userAccount === undefined || userAccount === null)
            return null;

        const authorizationRequest = AzureActiveDirectorySessionService._getAuthorizationRequest(AuthenticationFlow.Login);
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
            authenticationFlow: userSessionData.authenticationFlow,
            serializedMsalTokenCache: tokenCache.serialize()
        };
    }

    private _getTokenExpiration(): Date {
        const sessionExpiration = new Date();
        sessionExpiration.setMinutes(sessionExpiration.getMinutes() + config.azureActiveDirecotry.tokenLifeInMinutes - 15);
        return sessionExpiration;
    }

    private _getUserFlowUrl(authenticationFlow: AuthenticationFlow, originalUrl: string): string {
        const azureActiveDirecotryUserFlowName = AzureActiveDirectorySessionService._getAzureActiveDirectoryUserFlowName(authenticationFlow);
        const state = this._serializeState({ authenticationFlow, originalUrl });
        return `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com/${config.azureActiveDirecotry.tenantName}.onmicrosoft.com/${azureActiveDirecotryUserFlowName}/oauth2/v2.0/authorize?client_id=${config.azureActiveDirecotry.clientId}&scope=openid&redirect_uri=${config.azureActiveDirecotry.returnUrl}&response_mode=form_post&response_type=code&state=${state}`
    }


    private static readonly _azureActiveDirectoryUserFlowMapping: { readonly [key in AuthenticationFlow]: string } = {
        [AuthenticationFlow.Login]: config.azureActiveDirecotry.authenticationFlowName,
        [AuthenticationFlow.PasswordChange]: config.azureActiveDirecotry.passwordResetFlowName
    };

    private static _getAzureActiveDirectoryUserFlowName(authenticationFlow: AuthenticationFlow): string {
        const azureActiveDirecotryUserFlowName = AzureActiveDirectorySessionService._azureActiveDirectoryUserFlowMapping[authenticationFlow];
        if (azureActiveDirecotryUserFlowName === undefined || azureActiveDirecotryUserFlowName === null)
            throw Error(`Unknown authentication flow: '${Enum.getKey(AuthenticationFlow, authenticationFlow)}'.`);

        return azureActiveDirecotryUserFlowName;
    }

    private static _getConfidentialClientApplicationConfig(authenticationFlow: AuthenticationFlow): Configuration {
        const azureActiveDirecotryUserFlowName = AzureActiveDirectorySessionService._getAzureActiveDirectoryUserFlowName(authenticationFlow);
        return {
            auth: {
                clientId: config.azureActiveDirecotry.clientId,
                clientSecret: config.azureActiveDirecotry.clientSecret,
                authority: `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com/${config.azureActiveDirecotry.tenantName}.onmicrosoft.com/${azureActiveDirecotryUserFlowName}`,
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
    }

    private static _getAuthorizationRequest(authenticationFlow: AuthenticationFlow): AuthorizationUrlRequest {
        const azureActiveDirecotryUserFlowName = AzureActiveDirectorySessionService._getAzureActiveDirectoryUserFlowName(authenticationFlow);
        return {
            redirectUri: config.azureActiveDirecotry.returnUrl,
            authority: `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com/${config.azureActiveDirecotry.tenantName}.onmicrosoft.com/${azureActiveDirecotryUserFlowName}`,
            scopes: [],
            responseMode: ResponseMode.FORM_POST,
            maxAge: (config.azureActiveDirecotry.tokenLifeInMinutes * 60)
        };
    }

    private static _getLogoutUrl(authenticationFlow: AuthenticationFlow): string {
        const azureActiveDirecotryUserFlowName = AzureActiveDirectorySessionService._getAzureActiveDirectoryUserFlowName(authenticationFlow);
        return `https://${config.azureActiveDirecotry.tenantName}.b2clogin.com/${config.azureActiveDirecotry.tenantName}.onmicrosoft.com/${azureActiveDirecotryUserFlowName}/oauth2/v2.0/logout?post_logout_redirect_uri=${config.azureActiveDirecotry.returnUrl}`
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
    readonly tfp: string
}

export interface IAuthenticationResponseState {
    readonly authenticationFlow: AuthenticationFlow;
    readonly originalUrl: string;
}