import type { IBaseViewOptions } from "../IBaseViewOptions";
import type { IRequestResult } from "../results/IRequestResult";
import { RequestHandler } from "./RequestHandler";

export abstract class BasicQueryHandler<TRouteParams extends {} = {}, TViewOptions extends IBaseViewOptions = IBaseViewOptions, TQueryParams extends {} = {}> extends RequestHandler<TViewOptions> {
    public abstract executeQueryAsync(routeParams: TRouteParams, queryParmas: TQueryParams): Promise<IRequestResult>;
}