import type { Express } from "express";
import { tabs } from "../tabs";

export function registerHandlers(app: Express): void {
    app.get("/about", (req, res) => {
        res.render("about", { title: "About", tab: tabs.about });
    });
}