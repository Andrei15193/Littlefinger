import type { IBaseFormPageRequestBody } from "../IBaseFormPageRequestBody";
import type { IBaseViewOptions } from "../IBaseViewOptions";
import type { IRequestResult } from "../results/IRequestResult";
import type { Form } from "../../forms/Form";
import { RequestHandler } from "./RequestHandler";

export abstract class FormCommandHandler<TForm extends Form, TRouteParams extends {} = {}, TRequestBody extends IBaseFormPageRequestBody = IBaseFormPageRequestBody, TViewOptions extends IBaseViewOptions = IBaseViewOptions, TQueryParams extends {} = {}> extends RequestHandler<TViewOptions> {
    public abstract executeCommandAsync(form: TForm, routeParams: TRouteParams, requestBody: TRequestBody, queryParmas: TQueryParams, argument?: string): Promise<IRequestResult>;
}