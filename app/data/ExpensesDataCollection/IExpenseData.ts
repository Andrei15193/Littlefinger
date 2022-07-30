export interface IExpenseData {
    readonly month: string;
    readonly id: string;

    readonly name: string;
    readonly shop: string;
    readonly tags: readonly string[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: Date;
    readonly etag: string;
}