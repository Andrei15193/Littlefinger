import type { IDependencyContainer } from "../../dependencyContainer";
import type { IBasePageRequestBody } from "./IBasePageRequestBody";
import type { IBaseViewOptions } from "./IBaseViewOptions";
import type { QueryHandler } from "./handlers/QueryHandler";
import type { CommandHandler } from "./handlers/CommandHandler";

export abstract class Page<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody = IBasePageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions> {
    public abstract readonly route: string;

    public abstract readonly handlers: PageRequestHandlerDefinitions<TRouteParams, TRequestBody, TViewOptions>;
}

export type PageRequestHandlerDefinitions<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody, TViewOptions extends IBaseViewOptions> = [QueryHandlerConfiguration<TRouteParams, TViewOptions>, ...readonly ICommandHandlerDefinition<TRouteParams, TRequestBody, TViewOptions>[]];

export type QueryHandlerConfiguration<TRouteParams extends {}, TViewOptions extends IBaseViewOptions> = QueryHandlerType<TRouteParams, TViewOptions> | IQueryHandlerDefinition<TRouteParams, TViewOptions>;

export interface IRequestHandlerDefinition {
    readonly allowAnonymousRequests?: boolean;
}

export interface IQueryHandlerDefinition<TRouteParams extends {}, TViewOptions extends IBaseViewOptions> extends IRequestHandlerDefinition {
    readonly handlerType: QueryHandlerType<TRouteParams, TViewOptions>;
}

export interface ICommandHandlerDefinition<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody, TViewOptions extends IBaseViewOptions> extends IRequestHandlerDefinition {
    readonly name: string;

    readonly handlerType: CommandHandlerType<TRouteParams, TRequestBody, TViewOptions>;
}

export type QueryHandlerType<TRouteParams extends {}, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): QueryHandler<TRouteParams, TViewOptions, any> };
export type CommandHandlerType<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): CommandHandler<TRouteParams, TRequestBody, TViewOptions, any> };