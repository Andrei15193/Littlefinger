import type { Request, Response } from "express";
import type { IDependencyContainer } from "../../../dependencyContainer";

export interface IRequestResult {
    apply(req: Request, res: Response<unknown>, dependencies: IDependencyContainer): void;
}