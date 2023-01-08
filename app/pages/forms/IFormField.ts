export type IValidateCallback<TValue, TOption = TValue> = (field: IFormField<TValue, TOption>) => string | null;

export interface IFormField<TValue, TOption = TValue> {
    readonly name: string;

    value: TValue | null;

    options: readonly TOption[];

    readonly isValid: boolean | null;

    readonly isInvalid: boolean | null;

    readonly error: string | null;

    validate(): void;
}
