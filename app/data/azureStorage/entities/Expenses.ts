import type { TableEntity } from "@azure/data-tables";
import type { IStatefulEntity } from "./StatefulEntity";
import type { ExpenseState } from "../../../model/Expenses";

export interface IExpenseEntity extends TableEntity, IStatefulEntity<ExpenseState> {
    readonly month: string;
    readonly id: string;
    readonly name: string;
    readonly shop: string;
    readonly tags: string;
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: Date;
}

export interface IExpenseTagEntity extends TableEntity {
    readonly name: string;
    readonly color: number;
}