import type { Express } from "express";
import { registerHandlers as registerHomeHandlers } from "./home";
import { registerHandlers as registerExpensesHandlers } from "./expenses";
import { registerHandlers as registerAboutHandlers } from "./about";

export function registerHandlers(app: Express): void {
    registerHomeHandlers(app);
    registerExpensesHandlers(app);
    registerAboutHandlers(app);
}