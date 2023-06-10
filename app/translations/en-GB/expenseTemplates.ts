import type { IExpenseTemplatesTranslationLabels } from "../Translation";

export const expenseTemplatesTranslationLabels: IExpenseTemplatesTranslationLabels = {
    list: {
        title: "Expense Templates",
        pageTitle: "Expense Templates",
        addButtonLabel: "Add",

        columns: {
            name: "Name",
            actions: "Actions"
        },
        empty: "There are no expenses templates."
    },
    add: {
        title: "Add Expense Template",
        pageTitle: "Add Expense Template",

        addButtonLabel: "Add",
        cancelButtonLabel: "Cancel"
    },
    form: {
        name: {
            label: "Name",
            error: {
                required: "Please provide a name for the expense that would be made (at most 250 characters)."
            }
        },
        shop: {
            label: "Shop",
            error: {
                required: "Please provide the name of the shop where you made your purchase (at most 250 characters)."
            }
        },
        tags: {
            label: "Tags",
            error: {
                required: "Please provide at least one tag (useful when generating reports, at most 250 characters each, at most 25 tags in total)."
            },
            addMoreButtonLabel: "Add More"
        },
        currency: {
            error: {
                required: "Please provide the currency in which you made the purchase (at most 250 characters)."
            }
        },
        price: {
            label: "Price",
            error: {
                required: "Please provide a price that is greater than zero and has at most two decimals."
            }
        },
        quantity: {
            label: "Quantity",
            error: {
                required: "Please provide the quantity which must be an integer greater than zero."
            }
        },
        dayOfMonth: {
            label: "Day of month",
            error: {
                required: "Please provide the day of month when the expense that would be made."
            }
        },
        error: {
            unknown: "An unknown error has occurred, please reload the page and retry the operation",
            invalidEtag: "The expense template has already been edited or deleted",
            notFound(expensesMonth: string) {
                return {
                    message: "The expense you are trying to view does not exist.",
                    actions: [
                        `[Expense templates list view](/expense-templates/${expensesMonth}){.alert-link}`
                    ]
                };
            }
        }
    }
};