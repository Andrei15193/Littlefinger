import type { IFormError } from "../../translations/Translation";
import type { IFormField } from "./IFormField";

export abstract class Form {
    private _validated: boolean;
    private _etag: string | null;

    protected constructor() {
        this._validated = false;
        this._etag = null;
        this.error = null;
    }

    public get isValid(): boolean | null {
        if (this.error !== null || this._etag === undefined || this._etag === null)
            return false;
        else
            return this.fields.reduce<boolean | null>(
                (result, field) => result === null || field.isValid === null ? null : result && field.isValid,
                true
            );
    }

    public get isInvalid(): boolean | null {
        if (this.error !== null || this._etag === undefined || this._etag === null)
            return true;
        else
            return this.fields.reduce<boolean | null>(
                (result, field) => result === null || field.isInvalid === null ? null : result || field.isInvalid,
                false
            );
    }

    public error: IFormError | null;

    public get isValidated(): boolean {
        return this._validated;
    }

    public get etag(): string | null {
        return this._etag;
    }

    public set etag(value: string | null | undefined) {
        this._etag = value === null || value === undefined ? null : value;
    }

    public abstract readonly fields: readonly IFormField<any, any>[];

    public loadAsync(formBody: IFormBody): Promise<void> {
        this.fields.forEach(field => {
            field.value = formBody[field.name];
        });
        this.etag = formBody.etag;

        if (formBody.validated?.toLowerCase() === "true")
            this.validate();

        return Promise.resolve();
    }

    public validate(): void {
        this.fields.forEach(field => {
            field.validate();
        });
        this._validated = true;
    }
}

export interface IFormBody extends Record<string, string | boolean | number | Date | undefined | null> {
    readonly validated?: "true" | "false";
    readonly etag?: string;
}