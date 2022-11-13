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