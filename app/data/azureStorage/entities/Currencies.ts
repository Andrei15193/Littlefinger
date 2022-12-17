import type { TableEntity } from "@azure/data-tables";

export interface ICurrencyEntity extends TableEntity {
    readonly displayValue: string;
}