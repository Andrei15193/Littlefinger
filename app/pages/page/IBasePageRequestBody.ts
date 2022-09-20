export interface IBasePageRequestBody {
    readonly command: string;
}

export type PageRequestBody<TOther> = TOther & IBasePageRequestBody;