import type { Request, Response } from "express";
import type { IDependencyContainer } from "../../../dependencyContainer";
import type { IRequestResult } from "./IRequestResult";

export class RedirectRequestResult implements IRequestResult {
    private readonly _url: string;

    public constructor(url: string) {
        this._url = url;
    }

    public apply(req: Request, res: Response<unknown, Record<string, any>>, dependencies: IDependencyContainer): void {
        res.redirect(this._url);
    }
}