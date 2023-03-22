export type WithoutState<T> = T extends string | number | Date
    ? T
    : T extends (infer TItem)[]
    ? WithoutState<TItem>[]
    : T extends readonly (infer TItem)[]
    ? readonly WithoutState<TItem>[]
    : {
        [propertyName in keyof Omit<T, "state">]: T[propertyName]
    };

export type WithoutAnyState<T> = T extends string | number | Date
    ? T
    : T extends (infer TItem)[]
    ? WithoutAnyState<TItem>[]
    : T extends readonly (infer TItem)[]
    ? readonly WithoutAnyState<TItem>[]
    : {
        [propertyName in keyof Omit<T, "state">]: WithoutAnyState<T[propertyName]>
    };

export type WithoutRelatedStates<T> = T extends string | number | Date
    ? T
    : T extends (infer TItem)[]
    ? WithoutRelatedStates<TItem>[]
    : T extends readonly (infer TItem)[]
    ? readonly WithoutRelatedStates<TItem>[]
    : {
        [propertyName in keyof T]: WithoutAnyState<T[propertyName]>
    };