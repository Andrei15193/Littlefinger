import type { IExpensesTranslationLabels, IExpenseTagsTranslationLabels, IExpenseShopsTranslationLabels } from "../translations/Translation";

export interface IExpenseKey {
    readonly month: string;
    readonly id: string;
}

export interface IExpense {
    readonly key: IExpenseKey;

    readonly name: string;
    readonly shop: string;
    readonly tags: readonly IExpenseTag[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly amount: number;
    readonly date: Date;

    readonly warning?: IExpenseWarning;
    readonly state: ExpenseState;

    readonly etag: string;
}

export type ExpenseState = "ready" | "changingMonth";

export interface IExpenseWarning {
    readonly key: keyof IExpensesTranslationLabels["warnings"];
    readonly arguments: readonly (string | number | object)[];
}

export interface IExpenseTag {
    readonly name: string;
    readonly color: ExpenseTagColor;

    readonly warning?: IExpenseTagWarning;
    readonly state: ExpenseTagState;

    readonly etag: string;
}

export enum ExpenseTagColor {
    "1ABC9C", "16A085", "2ECC71", "27AE60", "3498DB", "2980B9", "9B59B6", "8E44AD", "34495E", "2C3E50", "F1C40F", "F39C12", "E67E22", "D35400", "E74C3C", "C0392B", "ECF0F1", "BDC3C7", "95A5A6", "7F8C8D",
    "FFADAD", "FFD6A5", "FDFFB6", "CAFFBF", "9BF6FF", "A0C4FF", "BDB2FF", "FFC6FF",
    "FF6361", "FFA600"
}

export type ExpenseTagState = "ready" | "renaming" | "deleting";

export interface IExpenseTagWarning {
    readonly key: keyof IExpenseTagsTranslationLabels["warnings"];
    readonly arguments: readonly (string | number | object)[];
}

export interface IExpenseShop {
    readonly name: string;

    readonly warning?: IExpenseShopWarning;
    readonly state: ExpenseShopState;

    readonly etag: string;
}

export type ExpenseShopState = "ready" | "renaming";

export interface IExpenseShopWarning {
    readonly key: keyof IExpenseShopsTranslationLabels["warnings"];
    readonly arguments: readonly (string | number | object)[];
}