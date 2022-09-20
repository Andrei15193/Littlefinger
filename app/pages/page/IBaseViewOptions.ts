import type { IApplicationTabs } from "../../applicationTabs";

export interface IBaseViewOptions {
    readonly title: string;
    readonly tab: keyof IApplicationTabs;
}