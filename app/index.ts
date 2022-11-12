import type { Express, CookieOptions, Request, Response } from "express";
import type { ITranslation } from "./translations/translation";
import type { ISessionService } from "./services/ISessionService";
import type { ICommandHandlerDefinition, IQueryHandlerDefinition, Page, QueryHandlerConfiguration } from "./pages/page";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { createHandlebarsInstance } from "./handlebars";
import { pages } from "./pages";
import { translations } from "./translations";
import { DependencyContainer } from "./dependencyContainer/DependencyContainer";
import { AzureStorageManager } from "./data/azureStorage/AzureStorageManager";
import { AzureStorage } from "./data/azureStorage/AzureStorage";
import { config } from "./config";
import { SessionServiceMock } from "./services/Mock/SessionServiceMock";

(async function startApplicationAsync(): Promise<void> {
    console = new console.Console({
        stdout: process.stdout,
        stderr: process.stderr,
        groupIndentation: 4
    });

    const args = readCommandLineArguments(process.argv);
    const port: number | undefined = args.named.port !== undefined ? Number(args.named.port) : undefined;

    const AzureTableStorageConnectionString = config.connectionStrings.azureStorage

    const azureStorageManager = new AzureStorageManager(new AzureStorage(AzureTableStorageConnectionString));
    await azureStorageManager.ensureTableStorageAsync({
        recreateTables: args.flags["recreate-tables"],
        deleteExtraTables: args.flags["delete-extra-tables"]
    });
    await azureStorageManager.ensureQueueStorageAsync({
        clearQueues: args.flags["clear-queues"]
    });

    const handlebars = createHandlebarsInstance(path.join(process.cwd(), "app", "views"));
    const app = express()
        .engine("hbs", handlebars.__express)
        .set("view engine", "hbs")
        .set("views", path.join(process.cwd(), "app", "views"))
        .set("view options", { layout: "layouts/default" })
        .use(express.static(path.join(process.cwd(), "app", "assets")))
        .use(express.urlencoded({ extended: true }))
        .use(cookieParser(config.http.cookieSecret));

    const dependencyReplacements: Partial<Omit<DependencyContainer, "user">> = {
        sessionService: args.flags["use-default-user"]
            ? new SessionServiceMock({
                id: "00000000-0000-0000-0000-000000000000",
                user: {
                    id: "00000000-0000-0000-0000-000000000000",
                    displayName: "Andrei",
                    defaultCurrency: "RON"
                },
                expiration: new Date()
            })
            : undefined
    };
    pages.forEach(page => {
        const expressPage = new ExpressPage(page, dependencyReplacements);
        expressPage.register(app);
    });

    if (port !== undefined)
        app.listen(port, () => console.log(`[server]: Server is running at http://localhost:${port}`));
    else
        app.listen();

    interface ICommandLineArguments {
        readonly flags: Record<string, boolean>;
        readonly named: Record<string, string>;
        readonly positional: string[];
    }

    function readCommandLineArguments(args: readonly string[]): ICommandLineArguments {
        let key: string | undefined = undefined;
        const commandLineArguments = args.reduce<ICommandLineArguments>(
            (result, value) => {
                if (value.startsWith("--") && value.length > 2) {
                    if (key !== undefined)
                        result.flags[key] = true;
                    key = value.substring(2);
                }
                else if (key !== undefined) {
                    result.named[key] = value;
                    key = undefined;
                }
                else
                    result.positional.push(value);
                return result;
            },
            { flags: {}, named: {}, positional: [] }
        )
        if (key !== undefined)
            commandLineArguments.flags[key] = true;

        return commandLineArguments;
    }
})();

class ExpressPage {
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
            res.redirect(await sessionService.getSignInUrlAsync(req.originalUrl));
        else {
            const start = new Date();
            if (sessionService.session === null)
                console.log(`Anonymous request for '${req.originalUrl}' from '${req.ip}'`);
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
            res.redirect(await sessionService.getSignInUrlAsync(req.originalUrl));
        else {
            const start = new Date();
            if (sessionService.session === null)
                console.log(`Anonymous command request for '${req.originalUrl}' from '${req.ip}'`);
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