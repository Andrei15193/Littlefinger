import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseFormData } from "../../ExpenseForm";
import type { PageRequestBody } from "../../../page/IBasePageRequestBody";
import { CommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class RemoveExpenseTagCommandHandler extends CommandHandler<IEditExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeCommandAsync({ id: expenseId }: IEditExpenseRouteParams, requestBody: PageRequestBody<IExpenseFormData>, queryParmas: {}, tag?: string): Promise<IRequestResult> {
        const form = await ExpenseForm.initializeAsync(requestBody, this._translation, this._expenseTagsRepository);
        form.removeTag(tag!);
        
        if (form.isValidated)
            form.validate();

        return this.render("expenses/edit", {
            title: this._translation.expenses.edit.title(expenseId),
            tab: "expenses",
            form
        });
    }
}