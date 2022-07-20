import type { Express } from "express";
import { tabs } from "../tabs";

export function registerHandlers(app: Express): void {
    app.get("/", (req, res) => {
        res.render("index", { title: "Home", tab: tabs.home });
    });
}