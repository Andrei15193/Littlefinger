import type { Form } from "./Form";
import type { IFormField, IValidateCallback } from "./IFormField";

export class RequiredDateFormField<TOption = Date> implements IFormField<Date, TOption> {
    private _value: Date | null;
    private _isValid: boolean | null;
    private _errorMessage: string | null;
    private readonly _invalidDateErrorMessage: string;
    private readonly _validators: readonly IValidateCallback<Date, TOption>[];

    public constructor(name: string, invalidTextErrorMessage: string, validators: readonly IValidateCallback<Date, TOption>[] = []) {
        this.name = name;
        this.options = [];
        this._isValid = null;
        this._value = null;
        this._errorMessage = null;
        this._invalidDateErrorMessage = invalidTextErrorMessage;
        this._validators = [this._validateDate, ...validators];
    }

    public readonly name: string;

    public get value(): Date | null {
        return this._value;
    }

    public set value(value: Date | string | null) {
        this._value = value === null ? null : value instanceof Date ? value : new Date(value);
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

    private _validateDate(field: IFormField<Date, TOption>): string | null {
        if (field.value !== undefined && field.value !== null)
            return null;
        else
            return this._invalidDateErrorMessage;
    }
}