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

        actions: {
            addExpense: "Add expense"
        },

        empty: "There are no expenses templates."
    },
    add: {
        title: "Add Expense Template",
        pageTitle: "Add Expense Template",

        addButtonLabel: "Add",
        cancelButtonLabel: "Cancel"
    },
    edit: {
        title(expenseId) {
            return `Edit Expense Template ${expenseId}`;
        },
        pageTitle: "Edit Expense Template",
        notFound: {
            title: "Expense Template Not Found"
        },

        updateButtonLabel: "Update",
        deleteButtonLabel: "Delete",
        cancelButtonLabel: "Cancel",

        deleteConfirmation: {
            title: "Confirm Deletion",
            message: "This action will permanently delete your expense template.\n\nPlease confirm your action.",
            confirmButtonLabel: "Confirm",
            cancelButtonLabel: "Cancel"
        }
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
            notFound: {
                message: "The expense template you are trying to view does not exist.",
                actions: [
                    "[Expense templates list view](/expense-templates){.alert-link}"
                ]
            }
        }
    }
};