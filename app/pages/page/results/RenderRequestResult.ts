import type { Request, Response } from "express";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { IBaseViewOptions } from "../IBaseViewOptions";
import type { IRequestResult } from "./IRequestResult";
import { config } from "../../../config";

export class RenderRequestResult<TOptions extends IBaseViewOptions> implements IRequestResult {
    private readonly _view: string;
    private readonly _options: TOptions;

    public constructor(view: string, options: TOptions) {
        this._view = view;
        this._options = options;
    }

    public apply({ params, protocol, headers: { host } }: Request, res: Response<unknown, Record<string, any>>, dependencies: IDependencyContainer): void {
        const { translation, tabs, user } = dependencies;
        const { tab, absolutePublicPath, ...remainingOptions } = this._options;

        res.render(this._view, {
            translation,
            publicPath: absolutePublicPath ? config.absolutePublicPathRoot : "",
            ...remainingOptions,
            tab: tabs[tab],
            tabs: tabs.all,
            user,
            route: params
        });
    }
}