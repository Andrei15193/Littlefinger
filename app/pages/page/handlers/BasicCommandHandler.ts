import type { IBasePageRequestBody } from "../IBasePageRequestBody";
import type { IBaseViewOptions } from "../IBaseViewOptions";
import type { IRequestResult } from "../results/IRequestResult";
import { RequestHandler } from "./RequestHandler";

export abstract class BasicCommandHandler<TRouteParams extends {} = {}, TRequestBody extends IBasePageRequestBody = IBasePageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions, TQueryParams extends {} = {}> extends RequestHandler<TViewOptions> {
    public abstract executeCommandAsync(routeParams: TRouteParams, requestBody: TRequestBody, queryParmas: TQueryParams, argument?: string): Promise<IRequestResult>;
}