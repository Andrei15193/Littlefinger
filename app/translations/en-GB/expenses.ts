import type { IExpensesTranslationLabels } from "../Translation";

export const expensesTranslationLabels: IExpensesTranslationLabels = {
    states: {
        changingMonth: "There is a pending request for changing the month of this expense."
    },
    warnings: {
        monthChange(expenseDate: string): string {
            return `An attempt was made to change the expense date to ${new Date(expenseDate).toLocaleDateString("en-GB")}, however the operation failed.`;
        },
    },

    list: {
        title: "Expenses",
        pageTitle: "Expenses",
        addButtonLabel: "Add",
        currentMonthLabel: "Current Month",
        untagged: "Untagged expenses",

        columns: {
            name: "Name",
            shop: "Shop",
            tags: "Tags",
            price: "Price",
            quantity: "Quantity",
            amount: "Amount",
            date: "Date"
        },
        totalsRow: {
            total: "Total"
        },
        empty: "There are no expenses made for this month."
    },
    add: {
        title: "Add Expense",
        pageTitle: "Add Expense",

        addButtonLabel: "Add",
        cancelButtonLabel: "Cancel"
    },
    edit: {
        title(expenseId) {
            return `Edit Expense ${expenseId}`;
        },
        pageTitle: "Edit Expense",
        notFound: {
            title: "Expense Not Found"
        },

        updateButtonLabel: "Update",
        copyButtonLabel: "Copy",
        deleteButtonLabel: "Delete",
        cancelButtonLabel: "Cancel",

        deleteConfirmation: {
            title: "Confirm Deletion",
            message: "This action will permanently delete your logged expense.\n\nPlease confirm your action.",
            confirmButtonLabel: "Confirm",
            cancelButtonLabel: "Cancel"
        }
    },
    copy: {
        title(expenseId) {
            return `Copy Expense ${expenseId}`;
        },
        pageTitle: "Copy Expense",
        notFound: {
            title: "Expense Not Found"
        },
        copyButtonLabel: "Copy",
        cancelButtonLabel: "Cancel"
    },
    form: {
        name: {
            label: "Name",
            error: {
                required: "Please provide a name for the expense that you have made (at most 250 characters)."
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
        date: {
            label: "Date",
            error: {
                required: "Please provide the date when you made the purchase."
            }
        },
        error: {
            notEditable: "The current expense has a pending request and cannot be updated.\n"
                + "\n"
                + "Please wait for the request to complete or expire to be able to edit this expense.",
            unknown: "An unknown error has occurred, please reload the page and retry the operation",
            invalidEtag: "The expense has already been edited or deleted",
            notFound(expensesMonth: string) {
                return {
                    message: "The expense you are trying to view does not exist.",
                    actions: [
                        `[Expenses list view](/expenses/${expensesMonth}){.alert-link}`
                    ]
                };
            }
        }
    }
};