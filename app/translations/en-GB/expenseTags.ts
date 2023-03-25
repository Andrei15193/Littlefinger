import type { IExpenseTagsTranslationLabels } from "../Translation";

export const expenseTagsTranslationLabels: IExpenseTagsTranslationLabels = {
    states: {
        renaming: "There is a pending request for changing the name of this expense tag.",
        removing: "There is a pending request for deleting this expense tag."
    },
    warnings: {
        remove: "An attempt was made to delete this tag, however the operation failed.",

        rename(newName: string): string {
            return `An attempt was made to change the name to '${newName}', however the operation failed.`;
        },

        renameTarget(initialName: string): string {
            return `An attempt was made to change the name of '${initialName}' expense tag to this one, however the operation failed.`;
        }
    },

    list: {
        title: "Expense Tags",
        pageTitle: "Expense Tags",

        columns: {
            name: "Name",
            actions: "Actions"
        },

        actions: {
            edit: "Edit",
            remove: "Delete"
        },

        empty: "There are no expense tags. These are automatically added as you log expenses."
    },

    edit: {
        modal: {
            title(expenseTagName: string): string {
                return `Edit ${expenseTagName}`;
            },
            name: {
                label: "Name",
                error: {
                    required: "Please provide a name for the expense tag (at most 250 characters)."
                }
            },
            color: {
                label: "Colour",
                error: {
                    required: "Please select a colour for the expense tag."
                }
            },
            message: "This action will update **all expenses** that currently have this expense tag as well. If there is another tag with the same name, then the two are merged.\n"
                + "\n"
                + "While this action is being performed no other action can be performed on this tag.\n"
                + "\n"
                + "Please confirm your action.",
            confirmButtonLabel: "Confirm",
            cancelButtonLabel: "Cancel"
        },

        errors: {
            notEditable: "The expense tag has a pending request and cannot be renamed.",
            notFound: "The expense tag you are trying to rename does not exist.",
            invalidEtag: "The expense tag has already been edited or deleted.",
            targetNotReady: "The target expense tag has a pending request and cannot be merged."
        }
    },

    remove: {
        modal: {
            title(expenseTagName: string): string {
                return `Delete ${expenseTagName}`;
            },
            message: "This action will delete the indexed tag, **all** expenses will be updated and have this tag removed.\n"
                + "\n"
                + "Please confirm your action.",
            confirmButtonLabel: "Confirm",
            cancelButtonLabel: "Cancel"
        },

        errors: {
            notEditable: "The expense tag has a pending request and cannot be deleted.",
            notFound: "The expense tag you are trying to delete does not exist.",
            invalidEtag: "The expense tag has already been edited or deleted."
        }
    }
}