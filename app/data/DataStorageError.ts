import type { RestError } from "@azure/data-tables";

export type DataStorageErrorReason = "Invalid etag" | "Not Found" | "Unknown";

export class DataStorageError extends Error {
    public constructor(reason: "Invalid etag");
    public constructor(restError: RestError);

    public constructor(reasonOrRestError: "Invalid etag" | RestError) {
        if (typeof reasonOrRestError === "string") {
            super();
            this.reason = reasonOrRestError;
            this.restError = null;
        }
        else {
            super(reasonOrRestError.message);
            switch (reasonOrRestError?.statusCode) {
                case 404:
                    this.reason = "Not Found";
                    break;

                case 412:
                    this.reason = "Invalid etag";
                    break;

                default:
                    this.reason = "Unknown";
                    break;
            }
            this.restError = reasonOrRestError;
        }
    }

    public readonly reason: DataStorageErrorReason;

    public readonly restError: RestError | null;

    public handle(callbacks: DataStorageErrorReasonMapping<(dataStorageError: DataStorageError) => void>): void {
        const callback = (callbacks[this.reason] || callbacks["Unknown"]);
        callback(this);
    }

    public override toString(lookup?: DataStorageErrorReasonMapping<string>): string {
        if (lookup !== undefined && lookup !== null)
            return lookup[this.reason] || lookup["Unknown"];
        else
            return super.toString();
    }
}

export type DataStorageErrorReasonMapping<TValue> =
    { readonly [reason in Exclude<DataStorageErrorReason, "Unknown">]?: TValue }
    & { readonly [reason in Extract<DataStorageErrorReason, "Unknown">]: TValue };