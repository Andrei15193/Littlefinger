import type { IApplicationTabs } from "../../ApplicationTabs";
import type { ITranslation } from "../../translations/Translation";

export interface IBaseViewOptions {
    readonly title: string;
    readonly tab: Exclude<keyof IApplicationTabs, "all">;
    readonly translation?: ITranslation;
    readonly absolutePublicPath?: true;
}