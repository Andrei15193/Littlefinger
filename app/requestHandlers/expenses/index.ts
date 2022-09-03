import type { Express } from "express";
import { registerHandlers as registerListHandlers } from "./list";
import { registerHandlers as registerDetailHandlers } from "./edit";
import { registerHandlers as registerCreateHandlers } from "./add";

export function registerHandlers(app: Express): void {
    registerListHandlers(app);
    registerCreateHandlers(app);
    registerDetailHandlers(app);
}