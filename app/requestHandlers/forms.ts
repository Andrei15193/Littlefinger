export interface IForm {
    isValidated: boolean;
    isValid: boolean;
    isInvalid: boolean;
    error?: string;
}

export type IEditForm<TForm extends IForm> = TForm & {
    readonly etag: string;
}

export interface IFormField<TValue> {
    value: TValue;
    options?: TValue extends readonly (infer TItem)[] ? readonly TItem[] : readonly TValue[];
    error?: string;
}

export type ExcludeFormNullValues<TForm extends IForm & { [field in keyof Omit<TForm, keyof IForm>]: IFormField<any> }> = IForm & {
    [field in keyof Omit<TForm, keyof IForm>]: Omit<TForm[field], "value"> & { readonly value: Exclude<TForm[field]["value"], null | undefined> }
};