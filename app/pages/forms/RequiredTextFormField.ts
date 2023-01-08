import type { IFormField, IValidateCallback } from "./IFormField";

export class RequiredTextFormField<TOption = string> implements IFormField<string, TOption> {
    private _value: string | null;
    private _isValid: boolean | null = null;
    private _error: string | null;
    private readonly _invalidTextError: string;
    private readonly _validators: readonly IValidateCallback<string, TOption>[];

    public constructor(name: string, invalidTextError: string, validators: readonly IValidateCallback<string, TOption>[] = []) {
        this.name = name;
        this.options = [];
        this._isValid = null;
        this._value = null;
        this._error = null;
        this._invalidTextError = invalidTextError;
        this._validators = [this._validateText, ...validators];
    }

    public readonly name: string;

    public get value(): string | null {
        return this._value;
    }

    public set value(value: string | null | undefined) {
        this._value = value === null || value === undefined ? null : value.trimEnd();
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

    private _validateText(field: IFormField<string, TOption>): string | null {
        if (field.value !== undefined && field.value !== null && field.value.length > 0 && field.value.trim().length > 0 && field.value.length <= 250)
            return null;
        else
            return this._invalidTextError;
    }
}