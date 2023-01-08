import type { IBaseViewOptions } from "../IBaseViewOptions";
import type { IRequestResult } from "../results/IRequestResult";
import type { Form } from "../../forms/Form";
import { RequestHandler } from "./RequestHandler";

export abstract class FormQueryHandler<TForm extends Form, TRouteParams extends {} = {}, TViewOptions extends IBaseViewOptions = IBaseViewOptions, TQueryParams extends {} = {}> extends RequestHandler<TViewOptions> {
    public abstract executeQueryAsync(form: TForm, routeParams: TRouteParams, queryParmas: TQueryParams): Promise<IRequestResult>;
}