import type { IDependencyContainer } from "../../dependencyContainer";
import type { IBaseFormPageRequestBody } from "./IBaseFormPageRequestBody";
import type { IBasePageRequestBody } from "./IBasePageRequestBody";
import type { IBaseViewOptions } from "./IBaseViewOptions";
import type { BasicQueryHandler } from "./handlers/BasicQueryHandler";
import type { BasicCommandHandler } from "./handlers/BasicCommandHandler";
import type { FormQueryHandler } from "./handlers/FormQueryHandler";
import type { FormCommandHandler } from "./handlers/FormCommandHandler";
import { Form } from "../forms/Form";

export interface IPage {
    readonly route: string;

    accept(visitor: IPageVisitor): void;
}

export interface IPageVisitor {
    visitBasicPage(page: BasicPage<any, any, any>): void;

    visitFormPage(page: FormPage<any, any, any, any>): void;
}

export abstract class BasicPage<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody = IBasePageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions> implements IPage {
    public abstract readonly route: string;

    public abstract readonly handlers: [IBasicQueryHandlerDefinition<TRouteParams, TViewOptions>, ...readonly IBasicCommandHandlerDefinition<TRouteParams, TRequestBody, TViewOptions>[]];

    public accept(visitor: IPageVisitor): void {
        visitor.visitBasicPage(this);
    }
}

export abstract class FormPage<TForm extends Form, TRouteParams extends {}, TRequestBody extends IBaseFormPageRequestBody = IBaseFormPageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions> implements IPage {
    public abstract readonly route: string;

    public abstract readonly formType: FormType<TForm>;

    public abstract readonly handlers: [IFormQueryHandlerDefinition<TForm, TRouteParams, TViewOptions>, ...readonly IFormCommandHandlerDefinition<TForm, TRouteParams, TRequestBody, TViewOptions>[]];

    public accept(visitor: IPageVisitor): void {
        visitor.visitFormPage(this);
    }
}

export interface IRequestHandlerDefinition {
    readonly allowAnonymousRequests?: boolean;
}

export interface IBasicQueryHandlerDefinition<TRouteParams extends {} = {}, TViewOptions extends IBaseViewOptions = IBaseViewOptions> extends IRequestHandlerDefinition {
    readonly handlerType: BasicQueryHandlerType<TRouteParams, TViewOptions>;
}

export interface IBasicCommandHandlerDefinition<TRouteParams extends {} = {}, TRequestBody extends IBasePageRequestBody = IBasePageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions> extends IRequestHandlerDefinition {
    readonly name: string;

    readonly handlerType: BasicCommandHandlerType<TRouteParams, TRequestBody, TViewOptions>;
}

export interface IFormQueryHandlerDefinition<TForm extends Form, TRouteParams extends {} = {}, TViewOptions extends IBaseViewOptions = IBaseViewOptions> extends IRequestHandlerDefinition {
    readonly handlerType: FormQueryHandlerType<TForm, TRouteParams, TViewOptions>;
}

export interface IFormCommandHandlerDefinition<TForm extends Form, TRouteParams extends {} = {}, TRequestBody extends IBaseFormPageRequestBody = IBaseFormPageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions> extends IRequestHandlerDefinition {
    readonly name: string;

    readonly handlerType: FormCommandHandlerType<TForm, TRouteParams, TRequestBody, TViewOptions>;
}

export type BasicQueryHandlerType<TRouteParams extends {}, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): BasicQueryHandler<TRouteParams, TViewOptions, any> };
export type BasicCommandHandlerType<TRouteParams extends {}, TRequestBody extends IBasePageRequestBody, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): BasicCommandHandler<TRouteParams, TRequestBody, TViewOptions, any> };

export type FormQueryHandlerType<TForm extends Form, TRouteParams extends {}, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): FormQueryHandler<TForm, TRouteParams, TViewOptions, any> };
export type FormCommandHandlerType<TForm extends Form, TRouteParams extends {}, TRequestBody extends IBaseFormPageRequestBody, TViewOptions extends IBaseViewOptions> = { new(dependencies: IDependencyContainer): FormCommandHandler<TForm, TRouteParams, TRequestBody, TViewOptions, any> };
export type FormType<TForm extends Form> = { new(dependencies: IDependencyContainer): TForm };