import type { IFormError, ITranslation } from "../../translations/Translation";
import type { IExpenseShop, IExpenseTag } from "../../model/Expenses";
import type { ICurrenciesRepository } from "../../data/repositories/expenses/ICurrenciesRepository";
import type { IExpenseTagsRepository } from "../../data/repositories/expenses/IExpenseTagsRepository";
import type { IExpenseShopsRepository } from "../../data/repositories/expenses/IExpenseShopsRepository";
import type { IForm, IFormField } from "../Forms";
import type { WithoutEtag } from "../../model/Common";
import { FormField, MultiValueFormField } from "../Forms";
import { isArray } from "../Array";
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

    public static async initializeAsync(expenseFormData: IExpenseFormData, translation: ITranslation, currenciesRepository: ICurrenciesRepository, expenseTagsRepository: IExpenseTagsRepository, expenseShopsRepository: IExpenseShopsRepository): Promise<ExpenseForm> {
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
        form.shop.options = await expenseShopsRepository.getAllAsync();
        form.currency.options = await currenciesRepository.getAllAsync();

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
            this.shop = new FormField<string, IExpenseShop>(),
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

    public readonly shop: FormField<string, IExpenseShop>;

    public readonly tags: MultiValueFormField<WithoutEtag<IExpenseTag>>;

    public readonly price: FormField<number>;

    public readonly currency: FormField<string>;

    public readonly quantity: FormField<number>;

    public readonly date: FormField<Date>;

    public etag: string | null;

    public validate(): void {
        if (this.name.isBlank || this.name.value!.length > 250)
            this.name.error = this._translation.expenses.form.name.error.required;
        if (this.shop.isBlank || this.shop.value!.length > 250)
            this.shop.error = this._translation.expenses.form.shop.error.required;
        if (this.tags.isBlank || this.tags.value!.length > 25 || this.tags.value!.some(tag => tag.name.length > 250))
            this.tags.error = this._translation.expenses.form.tags.error.required;
        if (this.price.isBlank || this.price.value! <= 0 || !Number.isInteger(this.price.value! * 100))
            this.price.error = this._translation.expenses.form.price.error.required;
        if (this.currency.isBlank || this.currency.value!.length > 250)
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