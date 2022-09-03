import type { Express } from "express";
import type { IApplicationTabs } from "../../applicationTabs";
import type { ITranslation } from "../../translations/translation";

export function registerHandlers(app: Express): void {
    app.get("/", (req, res) => {
        const tabs: IApplicationTabs = res.locals.tabs;
        const translation: ITranslation = res.locals.translation;

        res.render("index", { title: translation.home.title, tab: tabs.home });
    });
}