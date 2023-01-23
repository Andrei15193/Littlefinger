import type { IExpenseShopsTranslationLabels } from "../Translation";

export const expenseShopsTranslationLabels: IExpenseShopsTranslationLabels = {
    list: {
        title: "Expense Shops",
        pageTitle: "Expense Shops",

        actions: {
            rename: "Rename",
            delete: "Delete"
        },

        empty: "There are no indexed expense shops. These are automatically added as you log expenses."
    },

    delete: {
        confirmation: {
            title(expenseShopName: string): string {
                return `Confirm Deletion of ${expenseShopName}`;
            },
            message: "This action will delete the indexed shop name, but will not update any of the expenses.\n"
                + "\n"
                + "Performing this action will only remove this shop from the options shown when logging an expense.\n"
                + "\n"
                + "Please confirm your action.",
            confirmButtonLabel: "Confirm",
            cancelButtonLabel: "Cancel"
        },

        errors: {
            notFound: "The expense shop you are trying to delete does not exist.",
            invalidEtag: "The expense shop has already been edited or deleted."
        }
    }
}