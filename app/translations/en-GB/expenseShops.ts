import type { IExpenseShopsTranslationLabels } from "../Translation";

export const expenseShopsTranslationLabels: IExpenseShopsTranslationLabels = {
    states: {
        renaming: "There is a pending request for changing the name of this expense shop."
    },
    warnings: {
        rename(newName: string): string {
            return `An attempt was made to change the name to '${newName}', however the operation failed.`;
        },

        renameTarget(initialName: string): string {
            return `An attempt was made to change the name of '${initialName}' expense shop to this one, however the operation failed.`;
        }
    },

    list: {
        title: "Expense Shops",
        pageTitle: "Expense Shops",

        columns: {
            name: "Name",
            actions: "Actions"
        },

        actions: {
            rename: "Rename",
            delete: "Delete"
        },

        empty: "There are no indexed expense shops. These are automatically added as you log expenses."
    },

    rename: {
        modal: {
            title(expenseShopName: string): string {
                return `Rename ${expenseShopName}`;
            },
            name: {
                label: "Name",
                error: {
                    required: "Please provide a name for the expense shop (at most 250 characters)."
                }
            },
            message: "This action will update **all expenses** that currently have this expense shop as well. If there is another shop with the same name, then the two are merged.\n"
                + "\n"
                + "While this action is being performed no other action can be performed on this shop.\n"
                + "\n"
                + "Please confirm your action.",
            confirmButtonLabel: "Confirm",
            cancelButtonLabel: "Cancel"
        },

        errors: {
            notEditable: "The expense shop has a pending request and cannot be renamed.",
            notFound: "The expense shop you are trying to rename does not exist.",
            invalidEtag: "The expense shop has already been edited or deleted.",
            targetNotReady: "The target expense shop has a pending request and cannot be merged."
        }
    },

    delete: {
        modal: {
            title(expenseShopName: string): string {
                return `Delete ${expenseShopName}`;
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
            notEditable: "The expense shop has a pending request and cannot be deleted.",
            notFound: "The expense shop you are trying to delete does not exist.",
            invalidEtag: "The expense shop has already been edited or deleted."
        }
    }
}