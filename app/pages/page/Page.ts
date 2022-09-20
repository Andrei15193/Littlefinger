import type { Express } from "express";
import type { IDependencyContainer } from "../../dependencyContainer";
import type { IBasePageRequestBody } from "./IBasePageRequestBody";
import type { IBaseViewOptions } from "./IBaseViewOptions";
import type { QueryHandler } from "./handlers/QueryHandler";
import type { CommandHandler } from "./handlers/CommandHandler";

export abstract class Page<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody = IBasePageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions> {
    public abstract readonly route: string;

    public abstract readonly handlers: PageRequestHandlerDefinitions<TRouteParams, TRequestBody, TViewOptions>;

    public register(app: Express): void {
        const pageRoute = this.route;
        const [QueryHandlerType, ...commandHandlerDefinitions] = this.handlers;

        if (QueryHandlerType !== undefined && QueryHandlerType !== null)
            app.get<string, TRouteParams, unknown, never, any, any>(pageRoute, async (req, res) => {
                const queryHandler = new QueryHandlerType(res.dependencies);
                const queryResult = await queryHandler.executeQueryAsync(req.params, req.query);
                queryResult.apply(req, res);
            });

        if (commandHandlerDefinitions.length > 0) {
            app.post<string, TRouteParams, unknown, TRequestBody, any, any>(pageRoute, async (req, res) => {
                if (req.body.command === undefined || req.body.command === null)
                    throw new Error("Expected to find 'command' in request body.");

                let commandName = req.body.command;
                let commandArgument: string | undefined = undefined;

                const commandArgumentSeparatorIndex = commandName.indexOf(":");
                if (commandArgumentSeparatorIndex > 0) {
                    commandArgument = commandName.substring(commandArgumentSeparatorIndex + 1);
                    commandName = commandName.substring(0, commandArgumentSeparatorIndex);
                }
                commandName = commandName.toUpperCase();

                const commandHandlerDefinition = commandHandlerDefinitions.find(commandHandlerDefinition => commandHandlerDefinition.name.toUpperCase() === commandName);
                if (commandHandlerDefinition === undefined)
                    throw new Error(`Unknown '${req.body.command}' command.`);

                const CommandHandlerType = commandHandlerDefinition.handlerType;
                const commandHandler = new CommandHandlerType(res.dependencies);
                const commandResult = await commandHandler.executeCommandAsync(req.params, req.body, req.query, commandArgument);
                commandResult.apply(req, res);
            });
        }
    }
}

export type PageRequestHandlerDefinitions<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody, TViewOptions extends IBaseViewOptions> = [QueryHandlerType<TRouteParams, TViewOptions>, ...readonly ICommandHandlerDefinition<TRouteParams, TRequestBody, TViewOptions>[]];

export interface ICommandHandlerDefinition<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody, TViewOptions extends IBaseViewOptions> {
    readonly name: string;

    readonly handlerType: CommandHandlerType<TRouteParams, TRequestBody, TViewOptions>
}

export type QueryHandlerType<TRouteParams extends {}, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): QueryHandler<TRouteParams, TViewOptions, any> };
export type CommandHandlerType<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): CommandHandler<TRouteParams, TRequestBody, TViewOptions, any> };