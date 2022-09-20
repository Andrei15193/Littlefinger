import type { Request, Response } from "express";

export interface IRequestResult {
    apply(req: Request, res: Response<unknown>): void;
}