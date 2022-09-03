import type { ITranslation } from "../../translations/translation";
import type { ExcludeFormNullValues, IForm, IFormField } from "../forms";

export interface IExpenseForm extends IForm {
    readonly name: IFormField<string>;
    readonly shop: IFormField<string>;
    readonly tags: IFormField<readonly string[]>;
    readonly price: IFormField<number | null | undefined>;
    readonly currency: IFormField<string>;
    readonly quantity: IFormField<number>;
    readonly date: IFormField<Date | null | undefined>;
}

export async function fillOptionsAsync(form: IExpenseForm): Promise<void> {
    form.tags.options = ["Tag1", "Tag2"];
    form.shop.options = ["Shop 1", "Shop 2"];
    form.currency.options = ["RON", "EUR"];
}

export function validate(translation: ITranslation, form: IExpenseForm): form is ExcludeFormNullValues<IExpenseForm> {
    let isFormValid = true;

    if (form.name.value.length === 0) {
        form.name.error = translation.expenses.form.name.error.required;
        isFormValid = false;
    }
    if (form.shop.value.length === 0) {
        form.shop.error = translation.expenses.form.shop.error.required;
        isFormValid = false;
    }
    if (form.tags.value.length === 0) {
        form.tags.error = translation.expenses.form.tags.error.required;
        isFormValid = false;
    }
    if (form.price.value === null || form.price.value === undefined || Number.isNaN(form.price.value) || form.price.value <= 0 || !Number.isInteger(form.price.value * 100)) {
        form.price.error = translation.expenses.form.price.error.required;
        isFormValid = false;
    }
    if (form.currency.value.length === 0) {
        form.currency.error = translation.expenses.form.currency.error.required;
        isFormValid = false;
    }
    if (!Number.isInteger(form.quantity.value) || form.quantity.value <= 0) {
        form.quantity.error = translation.expenses.form.quantity.error.required;
        isFormValid = false;
    }
    if (form.date.value === null) {
        form.date.error = translation.expenses.form.date.error.required;
        isFormValid = false;
    }

    form.isValidated = true;
    form.isValid = isFormValid;
    form.isInvalid = !isFormValid;

    return isFormValid;
}