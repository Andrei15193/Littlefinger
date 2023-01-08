import type { IFormField, IValidateCallback } from "./IFormField";

export class RequiredDateFormField<TOption = Date> implements IFormField<Date, TOption> {
    private _value: Date | null;
    private _isValid: boolean | null;
    private _error: string | null;
    private readonly _invalidDateError: string;
    private readonly _validators: readonly IValidateCallback<Date, TOption>[];

    public constructor(name: string, invalidTextError: string, validators: readonly IValidateCallback<Date, TOption>[] = []) {
        this.name = name;
        this.options = [];
        this._isValid = null;
        this._value = null;
        this._error = null;
        this._invalidDateError = invalidTextError;
        this._validators = [this._validateDate, ...validators];
    }

    public readonly name: string;

    public get value(): Date | null {
        return this._value;
    }

    public set value(value: Date | string | null | undefined) {
        this._value = value === null || value === undefined ? null : value instanceof Date ? value : new Date(value);
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

    private _validateDate(field: IFormField<Date, TOption>): string | null {
        if (field.value !== undefined && field.value !== null)
            return null;
        else
            return this._invalidDateError;
    }
}