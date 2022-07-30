export interface IExpense {
    readonly name: string;
    readonly shop: string;
    readonly tags: readonly string[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: Date;
}