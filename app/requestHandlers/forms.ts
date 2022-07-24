export interface IFormField<TValue> {
    readonly value: TValue;
    error?: string;
}

export type ExcludeFormNullValues<TForm extends { [field in keyof TForm]: IFormField<any> }> = {
    [field in keyof TForm]: Omit<TForm[field], "value"> & { readonly value: Exclude<TForm[field]["value"], null | undefined> }
};