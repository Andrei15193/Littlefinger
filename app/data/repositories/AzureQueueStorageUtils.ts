export class AzureQueueStorageUtils {
    public static encodeMessage<T>(obj: T): string {
        return Buffer.from(JSON.stringify(obj, undefined, 0), 'utf-8').toString("base64");
    }
}