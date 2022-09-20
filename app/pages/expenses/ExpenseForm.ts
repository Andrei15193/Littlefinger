import type { IFormError, ITranslation } from "../../translations/translation";
import type { IExpenseTag } from "../../model/Expenses";
import type { IExpenseTagsRepository } from "../../data/repositories/expenses/IExpenseTagsRepository";
import type { IForm, IFormField } from "../forms";
import { FormField, MultiValueFormField } from "../forms";
import { isArray } from "../array";
import { ExpenseTagColor } from "../../model/Expenses";
import { Enum } from "../../global/Enum";

export interface IExpenseFormData {
    readonly validated: "true" | "false";
    readonly etag: string | undefined | null;

    readonly name: string | undefined | null;
    readonly shop: string | undefined | null;
    readonly tags: string | readonly string[] | undefined | null;
    readonly price: number | undefined | null;
    readonly currency: string | undefined | null;
    readonly quantity: number | undefined | null;
    readonly date: string | undefined | null;
}

export class ExpenseForm implements IForm {
    private _isValidated: boolean;
    private readonly _fields: readonly IFormField<any, any>[];
    private readonly _translation: ITranslation;

    public static async initializeAsync(expenseFormData: IExpenseFormData, translation: ITranslation, expenseTagsRepository: IExpenseTagsRepository): Promise<ExpenseForm> {
        const form = new ExpenseForm(translation);

        const allTagColors = Enum.getAllValues(ExpenseTagColor);
        const expenseTags = expenseFormData.tags === undefined || expenseFormData.tags === null
            ? []
            : isArray(expenseFormData.tags)
                ? expenseFormData.tags
                : [expenseFormData.tags];
        const expenseTagsByName = expenseTags.length === 0 ? {} : await expenseTagsRepository.getAllByName();

        form.etag = expenseFormData.etag === undefined ? null : expenseFormData.etag;

        form.name.value = expenseFormData.name === undefined || expenseFormData.name === null ? null : expenseFormData.name.trim();
        form.shop.value = expenseFormData.shop === undefined || expenseFormData.shop === null ? null : expenseFormData.shop.trim();
        form.tags.value =
            expenseTags
                ?.map(expenseTagName => expenseTagName?.trim())
                .filter(expenseTagName => expenseTagName !== undefined && expenseTagName !== null && expenseTagName.length > 0)
                .sort()
                .reduce<WithoutEtag<IExpenseTag>[]>(
                    (result, expenseTagName) => {
                        const expenseTag = expenseTagsByName[expenseTagName];
                        if (expenseTag === undefined) {
                            result.push({
                                name: expenseTagName,
                                color: allTagColors[Math.floor(Math.random() * 1000) % allTagColors.length]!
                            })
                        }
                        else
                            result.push(expenseTag);

                        return result;
                    },
                    []
                )
            || [];
        form.price.value = expenseFormData.price === undefined || expenseFormData.price === null ? Number.NaN : expenseFormData.price;
        form.currency.value = expenseFormData.currency === undefined || expenseFormData.currency === null ? null : expenseFormData.currency.trim().toLocaleUpperCase(translation.locale);
        form.quantity.value = expenseFormData.quantity === undefined || expenseFormData.quantity === null ? Number.NaN : expenseFormData.quantity;
        form.date.value = expenseFormData.date ? new Date(expenseFormData.date) : null;

        form.tags.options = await expenseTagsRepository.getAllAsync();
        form.shop.options = ["Shop 1", "Shop 2"];
        form.currency.options = ["RON", "EUR"];

        if (expenseFormData.validated === "true")
            form.validate();

        return form;
    }

    public static initializeFaulted(formError: IFormError, translation: ITranslation): ExpenseForm {
        const form = new ExpenseForm(translation);
        form.error = formError;
        return form;
    }

    private constructor(translation: ITranslation) {
        this._isValidated = false;
        this._fields = [
            this.name = new FormField<string>(),
            this.shop = new FormField<string>(),
            this.tags = new MultiValueFormField<WithoutEtag<IExpenseTag>>(),
            this.price = new FormField<number>(),
            this.currency = new FormField<string>(),
            this.quantity = new FormField<number>(),
            this.date = new FormField<Date>()
        ];
        this.error = null;
        this.etag = null;
        this._translation = translation;
    }

    public get isValidated(): boolean {
        return this._isValidated;
    }

    public get isValid(): boolean {
        return (this.error === undefined || this.error === null)
            && this._fields.every(field => field.error === undefined || field.error === null);
    }

    public get isInvalid(): boolean {
        return !this.isValid;
    }

    public error: IFormError | null;

    public readonly name: FormField<string>;

    public readonly shop: FormField<string>;

    public readonly tags: MultiValueFormField<WithoutEtag<IExpenseTag>>;

    public readonly price: FormField<number>;

    public readonly currency: FormField<string>;

    public readonly quantity: FormField<number>;

    public readonly date: FormField<Date>;

    public etag: string | null;

    public validate(): void {
        if (this.name.isBlank)
            this.name.error = this._translation.expenses.form.name.error.required;
        if (this.shop.isBlank)
            this.shop.error = this._translation.expenses.form.shop.error.required;
        if (this.tags.isBlank)
            this.tags.error = this._translation.expenses.form.tags.error.required;
        if (this.price.isBlank || this.price.value! <= 0 || !Number.isInteger(this.price.value! * 100))
            this.price.error = this._translation.expenses.form.price.error.required;
        if (this.currency.isBlank)
            this.currency.error = this._translation.expenses.form.currency.error.required;
        if (this.quantity.isBlank || this.quantity.value! <= 0)
            this.quantity.error = this._translation.expenses.form.quantity.error.required;
        if (this.date.isBlank)
            this.date.error = this._translation.expenses.form.date.error.required;

        this._isValidated = true;
    }

    public addTag(): void {
        const tagColors: readonly ExpenseTagColor[] = Enum.getAllValues(ExpenseTagColor);

        const availableColors = tagColors.filter(tagColor => this.tags.options?.find(tag => tag.color === tagColor) === undefined);
        const tagColor = availableColors[Math.random() * 1000 % availableColors.length]!;
        this.tags.value = [{ name: "", color: tagColor }, ...this.tags.value];
    }

    public removeTag(tag: string | readonly string[]): void {
        if (tag !== undefined)
            if (isArray(tag)) {
                const tagsToRemove = tag.map(tag => tag.toString().toLowerCase());
                this.tags.value = this.tags.value.filter(existingTag => !tagsToRemove.includes(existingTag.name.toLowerCase()));
            }
            else {
                const tagToRemove = tag.toString().toLowerCase();
                this.tags.value = this.tags.value.filter(existingTag => existingTag.name.toLowerCase() !== tagToRemove);
            }
    }
}