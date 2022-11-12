import type { IDependencyContainer } from "./dependencyContainer";
import type { ITranslation } from "./translations/translation";
import type { IApplicationTabs } from "./applicationTabs";

declare global {
    namespace Express {
        export interface Response {
            // readonly dependencies: IDependencyContainer;
        }

        export interface ViewOptions {
            readonly title: string;
            readonly tab: keyof IApplicationTabs;
        }

        export interface ListViewOptions<TItem> extends ViewOptions {
            readonly items: readonly TItem[];
        }

        export interface FormViewOptions<TForm> extends ViewOptions {
            readonly form: TForm;
        }
    }

    export type WithoutEtag<T> = T extends string | number | Date
        ? T
        : T extends (infer TItem)[]
        ? WithoutEtag<TItem>[]
        : T extends readonly (infer TItem)[]
        ? readonly WithoutEtag<TItem>[]
        : {
            [propertyName in keyof Omit<T, "etag">]: T[propertyName]
        };

    export type WithoutAnyEtag<T> = T extends string | number | Date
        ? T
        : T extends (infer TItem)[]
        ? WithoutAnyEtag<TItem>[]
        : T extends readonly (infer TItem)[]
        ? readonly WithoutAnyEtag<TItem>[]
        : {
            [propertyName in keyof Omit<T, "etag">]: WithoutAnyEtag<T[propertyName]>
        };

    export type WithoutRelatedEtags<T> = T extends string | number | Date
        ? T
        : T extends (infer TItem)[]
        ? WithoutRelatedEtags<TItem>[]
        : T extends readonly (infer TItem)[]
        ? readonly WithoutRelatedEtags<TItem>[]
        : {
            [propertyName in keyof T]: WithoutAnyEtag<T[propertyName]>
        };
}