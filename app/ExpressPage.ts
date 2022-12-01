import type { Express, CookieOptions, Request, Response } from "express";
import type { ITranslation } from "./translations/Translation";
import type { ISessionService } from "./services/ISessionService";
import type { ICommandHandlerDefinition, IQueryHandlerDefinition, Page, QueryHandlerConfiguration } from "./pages/page";
import { config } from "./config";
import { translations } from "./translations";
import { DependencyContainer } from "./dependencyContainer/DependencyContainer";

export class ExpressPage {
    private readonly _page: Page<any, any, any>;
    private readonly _dependencyReplacements: Partial<Omit<DependencyContainer, "user">>;

    public constructor(page: Page<any, any, any>, dependencyReplacements: Partial<Omit<DependencyContainer, "user">>) {
        this._page = page;
        this._dependencyReplacements = dependencyReplacements;
    }

    public register(app: Express): void {
        const pageRoute = this._page.route;
        const [queryHandlerConfiguration, ...commandHandlerDefinitions] = this._page.handlers;

        if (queryHandlerConfiguration !== undefined && queryHandlerConfiguration !== null) {
            const queryHandlerDefinition: IQueryHandlerDefinition<any, any> = this._isQueryHandlerDefinition(queryHandlerConfiguration)
                ? queryHandlerConfiguration
                : { allowAnonymousRequests: false, handlerType: queryHandlerConfiguration };
            app.get(pageRoute, (req, res) => this._handleQueryAsync(req, res, queryHandlerDefinition));
        }
        if (commandHandlerDefinitions.length > 0)
            app.post(pageRoute, (req, res) => this._handleCommandAsync(req, res, commandHandlerDefinitions));
    }

    private async _handleQueryAsync(req: Request, res: Response, queryHandlerDefinition: IQueryHandlerDefinition<any, any>): Promise<void> {
        const dependencies = this._getDependencyContainer(req, res);
        const { sessionService } = dependencies;
        await sessionService.tryLoadSessionAsync(req.signedCookies.userId, req.signedCookies.sessionId);

        if (queryHandlerDefinition.allowAnonymousRequests !== true && sessionService.session === null)
            res.redirect(sessionService.getSignInUrl(req.originalUrl));
        else {
            const start = new Date();
            if (sessionService.session === null)
                console.log(`Anonymous request for '${req.originalUrl}'`);
            else
                console.log(`Authenticated request for '${req.originalUrl}' from '${sessionService.session.user.id}' ('${req.ip}')`);

            try {
                console.group(`[${req.originalUrl}] Executing query`);

                const QueryHandlerType = queryHandlerDefinition.handlerType;
                const queryHandler = new QueryHandlerType(dependencies);
                const queryResult = await queryHandler.executeQueryAsync(req.params, req.query);

                this._handleSessionCookies(req, res, sessionService);
                queryResult.apply(req, res, dependencies);
            }
            catch (error) {
                console.error(`Executing query threw exception: ${error}`);
                throw error;
            }
            finally {
                const end = new Date();
                console.groupEnd();
                console.log(`[${req.originalUrl}] Completed execution of query, took about ${(end.getTime() - start.getTime()) / 1000} seconds`);
            }
        }
    }

    private async _handleCommandAsync(req: Request, res: Response, commandHandlerDefinitions: readonly ICommandHandlerDefinition<any, any, any>[]): Promise<void> {
        const commandArgumentSeparatorIndex = req.body.command?.indexOf(":") || -1;
        const commandName: string = commandArgumentSeparatorIndex > 0 ? req.body.command.substring(0, commandArgumentSeparatorIndex) : req.body.command || "";
        const commandArgument = commandArgumentSeparatorIndex > 0 ? req.body.command.substring(commandArgumentSeparatorIndex + 1) : undefined;
        const commandHandlerDefinition = commandHandlerDefinitions.find(commandHandlerDefinition => commandHandlerDefinition.name.localeCompare(commandName, "en-GB", { sensitivity: "base" }) === 0);

        if (commandHandlerDefinition === undefined || commandHandlerDefinition === null)
            throw new Error(commandHandlerDefinitions.some(commandHandlerDefinition => commandHandlerDefinition.allowAnonymousRequests === true)
                ? `Unknown command '${commandName}'.`
                : "You are not authorized to perform this operation.");

        const dependencies = this._getDependencyContainer(req, res);
        const { sessionService } = dependencies;
        await sessionService.tryLoadSessionAsync(req.signedCookies.userId, req.signedCookies.sessionId);

        if (commandHandlerDefinition.allowAnonymousRequests !== true && sessionService.session === null)
            res.redirect(sessionService.getSignInUrl(req.originalUrl));
        else {
            const start = new Date();
            if (sessionService.session === null)
                console.log(`Anonymous command request for '${req.originalUrl}'`);

            else
                console.log(`Authenticated command request for '${req.originalUrl}' from '${sessionService.session.user.id}' ('${req.ip}')`);

            try {
                console.group(
                    commandArgument === undefined
                        ? `Executing command '${commandHandlerDefinition.name}' without argument`
                        : `Executing command '${commandHandlerDefinition.name}' with argument '${commandArgument}`
                );

                const CommandHandlerType = commandHandlerDefinition.handlerType;
                const commandHandler = new CommandHandlerType(dependencies);
                const commandResult = await commandHandler.executeCommandAsync(req.params, req.body, req.query, commandArgument);

                this._handleSessionCookies(req, res, sessionService);
                commandResult.apply(req, res, dependencies);
            }
            catch (error) {
                console.error(`Executing command '${commandHandlerDefinition.name}' threw exception: ${error}`);
                throw error;
            }
            finally {
                const end = new Date();
                console.groupEnd();
                console.log(`Completed execution of command '${commandHandlerDefinition.name}', took about ${(end.getTime() - start.getTime()) / 1000} seconds`);
            }
        }
    }

    private _getDependencyContainer(req: Request, res: Response): DependencyContainer {
        const responseLocale = req.acceptsLanguages(...translations.map(translation => translation.locale)) || translations[0]?.locale;
        const translation: ITranslation = translations.filter(translation => translation.locale === responseLocale)[0]!;
        return new DependencyContainer(config.connectionStrings.azureStorage, translation, this._dependencyReplacements);
    }

    private _handleSessionCookies(req: Request, res: Response, sessionService: ISessionService): void {
        const { session, sessionUpdated } = sessionService;
        const signInUrl = sessionService.getSignInUrl(req.originalUrl);

        res.locals.signInUrl = signInUrl;
        if (session === null) {
            res.clearCookie("userId");
            res.clearCookie("sessionId");
        }
        else if (sessionUpdated) {
            const cookieOptions: CookieOptions = {
                httpOnly: true,
                signed: true,
                secure: true,
                sameSite: "lax",
                expires: session.expiration
            };

            res.cookie("userId", session.user.id, cookieOptions);
            res.cookie("sessionId", session.id, cookieOptions);
        }
    }

    private _isQueryHandlerDefinition(queryHandlerConfiguration: QueryHandlerConfiguration<any, any>): queryHandlerConfiguration is IQueryHandlerDefinition<any, any> {
        return queryHandlerConfiguration !== undefined
            && queryHandlerConfiguration !== null
            && (queryHandlerConfiguration as IQueryHandlerDefinition<any, any>).handlerType !== undefined
            && (queryHandlerConfiguration as IQueryHandlerDefinition<any, any>).handlerType !== null;
    }
}
