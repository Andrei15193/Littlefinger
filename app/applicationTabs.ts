import type { ITranslation } from "./translations/translation";

export interface IApplicationTabs {
    readonly home: IApplicationTab;
    readonly expenses: IApplicationTab;
    readonly about: IApplicationTab;

    readonly all: readonly IApplicationTab[];
}

export interface IApplicationTab {
    readonly path: string;
    readonly label: string;
    readonly disabled?: boolean;
}

export class ApplicationTabs implements IApplicationTabs {
    public constructor(translation: ITranslation) {
        this.home = {
            path: "/",
            label: translation.site.tabs.home
        };
        this.expenses = {
            path: "/expenses",
            label: translation.site.tabs.expenses
        };
        this.about = {
            path: "/about",
            label: translation.site.tabs.about
        };

        this.all = [
            this.home,
            this.expenses,
            this.about
        ];
    }
    
    readonly home: IApplicationTab;
    readonly expenses: IApplicationTab;
    readonly about: IApplicationTab;

    readonly all: readonly IApplicationTab[];
}