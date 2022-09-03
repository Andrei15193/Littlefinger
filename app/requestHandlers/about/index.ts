import type { Express } from "express";
import { IApplicationTabs } from "../../applicationTabs";

export function registerHandlers(app: Express): void {
    app.get("/about", (req, res) => {
        const tabs: IApplicationTabs = res.locals.tabs;

        res.render("about", { title: "About", tab: tabs.about });
    });
}