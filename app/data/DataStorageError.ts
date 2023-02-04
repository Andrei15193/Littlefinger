import type { RestError } from "@azure/data-tables";

export type DataStorageErrorReason = "TargetNorReady" | "InvalidEtag" | "NotFound" | "Unknown";

export class DataStorageError extends Error {
    public constructor(reason: "TargetNorReady" | "NotFound" | "InvalidEtag");
    public constructor(restError: RestError);

    public constructor(reasonOrRestError: "TargetNorReady" | "NotFound" | "InvalidEtag" | RestError) {
        if (typeof reasonOrRestError === "string") {
            super();
            this.reason = reasonOrRestError;
            this.restError = null;
        }
        else {
            super(reasonOrRestError.message);
            switch (reasonOrRestError?.statusCode) {
                case 404:
                    this.reason = "NotFound";
                    break;

                case 412:
                    this.reason = "InvalidEtag";
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
        const callback = (callbacks[DataStorageError._uncapitalize(this.reason)] || callbacks.unknown);
        callback(this);
    }

    public map<TResult>(lookup: DataStorageErrorReasonMapping<TResult>): TResult {
        return lookup[DataStorageError._uncapitalize(this.reason)] || lookup.unknown;
    }

    public override toString(lookup?: DataStorageErrorReasonMapping<string>): string {
        if (lookup !== undefined && lookup !== null)
            return lookup[DataStorageError._uncapitalize(this.reason)] || lookup.unknown;
        else
            return super.toString();
    }

    private static _uncapitalize(value: DataStorageErrorReason): Uncapitalize<DataStorageErrorReason> {
        return (value[0]?.toLowerCase() + value.substring(1)) as Uncapitalize<DataStorageErrorReason>;
    }
}

export type DataStorageErrorReasonMapping<TValue> =
    { readonly [reason in Uncapitalize<Exclude<DataStorageErrorReason, "Unknown">>]?: TValue }
    & { readonly [reason in Uncapitalize<Extract<DataStorageErrorReason, "Unknown">>]: TValue };