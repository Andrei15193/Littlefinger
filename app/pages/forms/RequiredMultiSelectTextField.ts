import type { Form, IFormField, IValidateCallback } from ".";

export class RequiredMultiSelectTextField<TOption = string> implements IFormField<readonly string[], TOption> {
    private _value: readonly string[];
    private _isValid: boolean | null;
    private _errorMessage: string | null;
    private readonly _invalidItemsErrorMessage: string;
    private readonly _validators: readonly IValidateCallback<readonly string[], TOption>[];

    public constructor(name: string, invalidItemsErrorMessage: string, validators: readonly IValidateCallback<readonly string[], TOption>[] = []) {
        this.name = name;
        this.maximumItemLimit = null;
        this.options = [];
        this._isValid = null;
        this._value = [];
        this._errorMessage = null;
        this._invalidItemsErrorMessage = invalidItemsErrorMessage;
        this._validators = [this._validateItems, ...validators];
    }

    public readonly name: string;

    public maximumItemLimit: number | null;

    public get value(): readonly string[] {
        return this._value;
    }

    public set value(value: readonly string[] | null) {
        this._value = value === null || value === undefined ? [] : value.filter(item => item !== null && item !== undefined && item.trim().length > 0).map(item => item.trimEnd());
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

    private _validateItems(field: IFormField<readonly string[], TOption>): string | null {
        if (field.value !== undefined && field.value !== null && field.value.length > 0 && (this.maximumItemLimit === null || field.value.length <= this.maximumItemLimit) && field.value.every(item => item.length <= 250))
            return null;
        else
            return this._invalidItemsErrorMessage;
    }
}