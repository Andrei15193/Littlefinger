import type { Express } from "express";
import { registerHandlers as registerGetHandlers } from "./get";
import { registerHandlers as registerPostHandlers } from "./post";

export function registerHandlers(app: Express): void {
    registerGetHandlers(app);
    registerPostHandlers(app);
}