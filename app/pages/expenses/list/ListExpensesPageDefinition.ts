import type { IBaseViewOptions } from "../../page";
import type { IExpense } from "../../../model/Expenses";

export interface IListExpensesRouteParams {
    readonly month?: string;
}

export interface IListExpensesViewOptions extends IBaseViewOptions {
    readonly expenses: readonly IExpense[];
    readonly totals: readonly ITotal[];
    readonly format: {
        readonly integerDigitsCount: {
            readonly price?: number;
            readonly quantity?: number;
            readonly amount?: number;
        }
    },
    readonly pagination: {
        readonly nextMonth: string;
        readonly currentMonth: string;
        readonly previousMonth: string;
    }
}

export interface ITotal {
    readonly currency: string;
    readonly amount: number;
}