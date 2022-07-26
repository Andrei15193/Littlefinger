import type { Express } from "express";
import { registerHandlers as registerListHandlers } from "./list";
import { registerHandlers as registerDetailHandlers } from "./detail";
import { registerHandlers as registerCreateHandlers } from "./create";

export function registerHandlers(app: Express): void {
    registerListHandlers(app);
    registerCreateHandlers(app);
    registerDetailHandlers(app);
}