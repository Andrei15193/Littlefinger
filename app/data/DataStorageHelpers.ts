export function getExpenseMonth(date: Date): string {
    return date.toISOString().substring(0, "YYYY-MM".length);
}

export function isValidEtag(etag: string | undefined | null): boolean {
    return !isInvalidEtag(etag)
}

export function isInvalidEtag(etag: string | undefined | null): etag is null | undefined | "*" {
    return etag === undefined || etag === null || etag === "*";
}