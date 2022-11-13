import type { IApplicationTabs } from "../../ApplicationTabs";

export interface IBaseViewOptions {
    readonly title: string;
    readonly tab: keyof IApplicationTabs;
}