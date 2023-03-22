import type { IStatefulEntity } from "../azureStorage/entities/StatefulEntity";

export class AzureTableStorageUtils {
    public static escapeKeyValue(value: string): string {
        return value.replace(
            /(?<reserved>[@\\/#\?%])|(?<control>[\u0000-\u001F\u007F-\u009F\t\n\r]+)/g,
            function (_, reserved) {
                return reserved !== undefined ? `@${reserved.charCodeAt(0).toString(16)}` : "";
            }
        );
    }

    public static isValidEtag(etag: string | undefined | null): boolean {
        return !AzureTableStorageUtils.isInvalidEtag(etag)
    }

    public static isInvalidEtag(etag: string | undefined | null): etag is null | undefined | "*" {
        return etag === undefined || etag === null || etag === "*";
    }

    public static hasWarning(statefulEntity: IStatefulEntity<unknown>): boolean {
        const currentDate = new Date();

        const hasWarning = (statefulEntity.warning !== null && statefulEntity.warning !== undefined
            && statefulEntity.warningActivation !== null && statefulEntity.warningActivation !== undefined
            && statefulEntity.warningActivation < currentDate);

        return hasWarning;
    }
}