import type { IBasePageRequestBody } from "./IBasePageRequestBody";

export interface IBasePageRequestFormBody extends IBasePageRequestBody {
    readonly validated: "true" | "false";
    readonly etag: string | undefined;
}
