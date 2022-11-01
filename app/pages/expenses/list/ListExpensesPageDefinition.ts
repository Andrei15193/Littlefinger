import type { IBaseViewOptions } from "../../page";
import type { IExpense, IExpenseTag } from "../../../model/Expenses";

export interface IListExpensesRouteParams {
    readonly month?: string;
}

export interface IListExpensesQueryParams {
    readonly currency?: string;
}

export interface IListExpensesViewOptions extends IBaseViewOptions {
    readonly expenses: readonly IExpense[];
    readonly totals: readonly ICurrencyTotal[];
    readonly currencyTagDistirbutions: readonly ITagDistribution[];
    readonly filters: {
        readonly currency?: string;
    }
    readonly format: {
        readonly integerDigitsCount: {
            readonly price?: number;
            readonly quantity?: number;
            readonly amount?: number;
        }
    },
    readonly pagination: {
        readonly currentDateMonth: string;
        readonly nextMonth: string;
        readonly currentMonth: string;
        readonly previousMonth: string;
    }
}

export interface ICurrencyTotal {
    readonly currency: string;
    readonly amount: number;
}

export interface ITagTotal {
    readonly tag: IExpenseTag | null;
    readonly amount: number;
}

export interface ITagDistribution {
    readonly tag: IExpenseTag | null;
    readonly amount: number;
    readonly percentage: number;
}