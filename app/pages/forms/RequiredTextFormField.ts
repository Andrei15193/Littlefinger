import type { Form } from "./Form";
import type { IFormField, IValidateCallback } from "./IFormField";

export class RequiredTextFormField<TOption = string> implements IFormField<string, TOption> {
    private _value: string | null;
    private _isValid: boolean | null = null;
    private _errorMessage: string | null;
    private readonly _invalidTextErrorMessage: string;
    private readonly _validators: readonly IValidateCallback<string, TOption>[];

    public constructor(name: string, invalidTextErrorMessage: string, validators: readonly IValidateCallback<string, TOption>[] = []) {
        this.name = name;
        this.options = [];
        this._isValid = null;
        this._value = null;
        this._errorMessage = null;
        this._invalidTextErrorMessage = invalidTextErrorMessage;
        this._validators = [this._validateText, ...validators];
    }

    public readonly name: string;

    public get value(): string | null {
        return this._value;
    }

    public set value(value: string | null) {
        this._value = value === null ? null : value.trimEnd();
    }

    public options: readonly TOption[];

    public get isValid(): boolean | null {
        return this._isValid;
    }

    public get isInvalid(): boolean | null {
        return this._isValid === null ? null : !this._isValid;
    }

    public get errorMessage(): string | null {
        return this._errorMessage;
    }

    public validate(form: Form): void {
        let errorMessage: string | null = null;
        let validatorIndex = 0;
        while (validatorIndex < this._validators.length && errorMessage === null) {
            errorMessage = this._validators[validatorIndex]!.call(this, this, form);
            validatorIndex++;
        }

        this._errorMessage = errorMessage;
        this._isValid = this._errorMessage === null;
    }

    private _validateText(field: IFormField<string, TOption>): string | null {
        if (field.value !== undefined && field.value !== null && field.value.length > 0 && field.value.trim().length > 0 && field.value.length <= 250)
            return null;
        else
            return this._invalidTextErrorMessage;
    }
}