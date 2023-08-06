import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { IFormError, ITranslation } from "../../../../translations/Translation";
import type { ICopyExpenseRouteParams } from "../CopyExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpensePageRequestFormBody } from "../../IExpensePageRequestFormBody";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { FormCommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class RemoveExpenseTagCommandHandler extends FormCommandHandler<ExpenseForm, ICopyExpenseRouteParams, IExpensePageRequestFormBody, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;

    public constructor({ translation }: IDependencyContainer) {
        super();
        this._translation = translation;
    }

    public async executeCommandAsync(form: ExpenseForm, { month: expenseMonth, id: expenseId }: ICopyExpenseRouteParams, requestBody: IExpensePageRequestFormBody, queryParams: any, tag?: string): Promise<IRequestResult> {
        try {
            const tagIndexToRemove = form.tags.value.indexOf(tag!);
            if (tagIndexToRemove >= 0)
                form.tags.value = form.tags.value.slice(0, tagIndexToRemove).concat(form.tags.value.slice(tagIndexToRemove + 1));

            if (form.isValidated)
                form.validate();

            return this.render("expenses/copy", {
                title: this._translation.expenses.copy.title(expenseId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            form.error = dataStorageError.map<IFormError>({
                notFound: this._translation.expenses.form.error.notFound(expenseMonth),
                unknown: this._translation.expenses.form.error.unknown
            });
            return this.render("expenses/edit-not-found", {
                title: this._translation.expenses.copy.title(expenseId),
                tab: "expenses",
                state: "ready",
                form
            });
        }
    }
}