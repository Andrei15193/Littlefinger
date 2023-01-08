import type { IBaseFormPageRequestBody } from "../page/IBaseFormPageRequestBody";

export interface IExpensePageRequestFormBody extends IBaseFormPageRequestBody {
    readonly name: string | undefined | null;
    readonly shop: string | undefined | null;
    readonly tags: string | readonly string[] | undefined | null;
    readonly price: number | undefined | null;
    readonly currency: string | undefined | null;
    readonly quantity: number | undefined | null;
    readonly date: string | undefined | null;
}