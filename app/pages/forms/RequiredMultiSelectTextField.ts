import type { IFormField, IValidateCallback } from ".";
import { isArray } from "../Array";

export class RequiredMultiSelectTextField<TOption = string> implements IFormField<readonly string[], TOption> {
    private _value: readonly string[];
    private _isValid: boolean | null;
    private _error: string | null;
    private readonly _invalidItemsError: string;
    private readonly _validators: readonly IValidateCallback<readonly string[], TOption>[];

    public constructor(name: string, invalidItemsError: string, validators: readonly IValidateCallback<readonly string[], TOption>[] = []) {
        this.name = name;
        this.maximumItemLimit = null;
        this.options = [];
        this._isValid = null;
        this._value = [];
        this._error = null;
        this._invalidItemsError = invalidItemsError;
        this._validators = [this._validateItems, ...validators];
    }

    public readonly name: string;

    public maximumItemLimit: number | null;

    public get value(): readonly string[] {
        return this._value;
    }

    public set value(value: readonly string[] | string | null | undefined) {
        this._value = value === null || value === undefined
            ? []
            : (isArray<string>(value) ? value : [value]).filter(item => item !== null && item !== undefined).map(item => item.trimEnd());
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

    private _validateItems(field: IFormField<readonly string[], TOption>): string | null {
        if (field.value !== undefined && field.value !== null && field.value.length > 0 && (this.maximumItemLimit === null || field.value.length <= this.maximumItemLimit) && field.value.every(item => item.length <= 250))
            return null;
        else
            return this._invalidItemsError;
    }
}