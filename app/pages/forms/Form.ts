import type { IFormField } from "./IFormField";

export abstract class Form {
    protected constructor() {
        this.errorMessage = null;
    }

    public get isValid(): boolean | null {
        if (this.errorMessage !== null)
            return false;

        else
            return this.fields.reduce<boolean | null>(
                (result, field) => result === null || field.isValid === null ? null : result && field.isValid,
                true
            );
    }

    public get isInvalid(): boolean | null {
        if (this.errorMessage !== null)
            return true;

        else
            return this.fields.reduce<boolean | null>(
                (result, field) => result === null || field.isInvalid === null ? null : result || field.isInvalid,
                false
            );
    }

    public errorMessage: string | null;

    public abstract readonly fields: readonly IFormField<any>[];

    public abstract loadOptionsAsync(): Promise<void>;

    public loadFrom(formBody: Record<string, string | boolean | number | Date>): void {
        this.fields.forEach(field => {
            field.value = (formBody as Record<string, any>)[field.name];
        });
    }

    public validate(): void {
        this.fields.forEach(field => {
            field.validate(this);
        });
    }
}
