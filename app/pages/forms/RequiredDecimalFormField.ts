import type { IFormField, IValidateCallback } from "./IFormField";

export class RequiredDecimalFormField<TOption = number> implements IFormField<number, TOption> {
    private _value: number | null;
    private _isValid: boolean | null;
    private _error: string | null;
    private readonly _invalidNumberError: string;
    private readonly _validators: readonly IValidateCallback<number, TOption>[];

    public constructor(name: string, invalidNumberError: string, validators: readonly IValidateCallback<number, TOption>[] = []) {
        this.name = name;
        this.options = [];
        this._isValid = null;
        this._value = null;
        this._error = null;
        this._invalidNumberError = invalidNumberError;
        this._validators = [this._validateDecimal, ...validators];
    }

    public readonly name: string;

    public get value(): number | null {
        return this._value;
    }

    public set value(value: number | string | null | undefined) {
        this._value = value === null || value === undefined || value === "" ? null : typeof value === "number" ? value : Number(value);
    }

    public options: readonly TOption[];

    public get isValid(): boolean | null {
        return this._isValid;
    }

    public get isInvalid(): boolean | null {
        return this._isValid === null ? null : !this._isValid;
    }

    public get error(): string | null {
        return this._error;
    }

    public validate(): void {
        let error: string | null = null;
        let validatorIndex = 0;
        while (validatorIndex < this._validators.length && error === null) {
            error = this._validators[validatorIndex]!.call(this, this);
            validatorIndex++;
        }

        this._error = error;
        this._isValid = this._error === null;
    }

    private _validateDecimal(field: IFormField<number, TOption>): string | null {
        if (field.value !== undefined && field.value !== null && Number.isFinite(field.value) && field.value > 0 && /^(\d{1,3},)*\d{1,3}(\.\d\d?)?$/.test(field.value.toLocaleString("en-GB")))
            return null;
        else
            return this._invalidNumberError;
    }
}
