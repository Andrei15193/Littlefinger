import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/translation";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IAddExpenseRouteParams } from "../AddExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { PageRequestBody } from "../../../page/IBasePageRequestBody";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseFormData } from "../../ExpenseForm";
import { CommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";

export class RemoveExpenseTagCommandHandler extends CommandHandler<IAddExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeCommandAsync(routeParams: IAddExpenseRouteParams, requestBody: PageRequestBody<IExpenseFormData>, queryParmas: {}, tag: string): Promise<IRequestResult> {
        const form = await ExpenseForm.initializeAsync(requestBody, this._translation, this._expenseTagsRepository);
        form.removeTag(tag);

        return this.render("expenses/add", {
            title: this._translation.expenses.add.title,
            tab: "expenses",
            state: "ready",
            form
        });
    }
}