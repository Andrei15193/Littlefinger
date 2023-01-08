import type { IBasePageRequestBody } from "./IBasePageRequestBody";

export interface IBaseFormPageRequestBody extends IBasePageRequestBody {
    readonly validated: "true" | "false";
    readonly etag: string | undefined | null;
}