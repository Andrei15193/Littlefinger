export function isArray<T>(value: any): value is T[] | readonly T[] {
    return Array.isArray(value);
}