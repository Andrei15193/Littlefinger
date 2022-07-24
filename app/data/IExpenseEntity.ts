import type { TableEntity } from "@azure/data-tables";

export interface IExpenseEntity extends TableEntity {
    readonly name: string;
    readonly shop: string;
    readonly tags: string;
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: Date;
}