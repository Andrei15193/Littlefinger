import type { ExcludeFormNullValues, IFormField } from "../forms";

export interface IExpenseForm {
    readonly name: IFormField<string>;
    readonly shop: IFormField<string>;
    readonly tags: IFormField<readonly string[]>;
    readonly price: IFormField<number | null | undefined>;
    readonly currency: IFormField<string>;
    readonly quantity: IFormField<number>;
    readonly date: IFormField<Date | null | undefined>
}

export function validate(form: IExpenseForm): form is ExcludeFormNullValues<IExpenseForm> {
    let isFormValid = true;

    if (form.name.value.length === 0) {
        form.name.error = "Please provide a name for the expense that you have made";
        isFormValid = false;
    }
    if (form.shop.value.length === 0) {
        form.shop.error = "Please provide the name of the shop where you made your purchase";
        isFormValid = false;
    }
    if (form.tags.value.length === 0) {
        form.tags.error = "Please provide at least one tag (useful when generating reports)";
        isFormValid = false;
    }
    if (form.price.value === null || form.price.value === undefined || Number.isNaN(form.price.value) || form.price.value <= 0 || !Number.isInteger(form.price.value * 100)) {
        form.price.error = "Please provide a price that is greater than zero and has at most two decimals";
        isFormValid = false;
    }
    if (form.currency.value.length === 0) {
        form.currency.error = "Please provide the currency in which you made the purchase";
        isFormValid = false;
    }
    if (!Number.isInteger(form.quantity.value) || form.quantity.value <= 0) {
        form.quantity.error = "Please provide the quantity which must be an integer greater than zero";
        isFormValid = false;
    }
    if (form.date.value === null) {
        form.date.error = "Please provide the date when you made the purchase";
        isFormValid = false;
    }

    return isFormValid;
}