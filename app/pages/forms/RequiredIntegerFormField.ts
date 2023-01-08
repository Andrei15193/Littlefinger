import type { Form } from "./Form";
import type { IFormField, IValidateCallback } from "./IFormField";

export class RequiredIntegerFormField<TOption = number> implements IFormField<number, TOption> {
    private _value: number | null;
    private _isValid: boolean | null;
    private _errorMessage: string | null;
    private readonly _invalidNumberErrorMessage: string;
    private readonly _validators: readonly IValidateCallback<number, TOption>[];

    public constructor(name: string, invalidNumberErrorMessage: string, validators: readonly IValidateCallback<number, TOption>[] = []) {
        this.name = name;
        this.options = [];
        this._isValid = null;
        this._value = null;
        this._errorMessage = null;
        this._invalidNumberErrorMessage = invalidNumberErrorMessage;
        this._validators = [this._validateInteger, ...validators];
    }

    public readonly name: string;

    public get value(): number | null {
        return this._value;
    }

    public set value(value: number | string | null) {
        this._value = null ? null : typeof value === "number" ? value : Number(value);
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

    private _validateInteger(field: IFormField<number, TOption>): string | null {
        if (field.value !== undefined && field.value !== null && Number.isFinite(field.value) && field.value > 0 && Number.isInteger(field.value))
            return null;
        else
            return this._invalidNumberErrorMessage;
    }
}