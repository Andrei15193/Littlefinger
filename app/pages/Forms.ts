import type { IFormError } from "../translations/Translation";

export interface IForm {
    isValidated: boolean;
    isValid: boolean;
    isInvalid: boolean;
    error: IFormError | null;
}

export interface IFormField<TValue, TOption> {
    value: TValue;
    options: readonly TOption[];
    error: string | null;

    readonly isBlank: boolean;
}

export class FormField<TValue, TOption = TValue> implements IFormField<TValue | null, TOption> {
    public value: TValue | null = null;

    public options: readonly TOption[] = [];

    public error: string | null = null;

    public get isBlank(): boolean {
        return this.value === null
            || this.value === undefined
            || (typeof this.value === "string" && /^\s*$/.test(this.value))
            || (typeof this.value === "number" && Number.isNaN(this.value))
    }
}

export class MultiValueFormField<TValue> implements IFormField<readonly TValue[], TValue> {
    public value: readonly TValue[] = [];

    public options: readonly TValue[] = [];

    public error: string | null = null;

    public get isBlank(): boolean {
        return this.value === null
            || this.value === undefined
            || this.value.length === 0;
    }
}