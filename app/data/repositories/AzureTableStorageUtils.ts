export class AzureTableStorageUtils {
    public static getExpenseMonth(date: Date): string {
        return date.toISOString().substring(0, "YYYY-MM".length);
    }

    public static isValidEtag(etag: string | undefined | null): boolean {
        return !AzureTableStorageUtils.isInvalidEtag(etag)
    }

    public static isInvalidEtag(etag: string | undefined | null): etag is null | undefined | "*" {
        return etag === undefined || etag === null || etag === "*";
    }
}