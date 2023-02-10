import type { IDependencyContainer } from "../../../../dependencyContainer/index";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results/index";
import type { IListExpenseTagsRouteParams, IListExpenseTagsViewOptions } from "../ListExpenseTagsPageDefinition";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { ExpenseTagForm } from "../../ExpenseTagForm";
import { FormQueryHandler } from "../../../page/index";

export class GetExpenseTagsQueryHandler extends FormQueryHandler<ExpenseTagForm, IListExpenseTagsRouteParams, IListExpenseTagsViewOptions> {
    private readonly _translation: ITranslation;
    private _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expenseTagsRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeQueryAsync(form: ExpenseTagForm): Promise<IRequestResult> {
        return this.render("expenseTags/list", {
            title: this._translation.expenseTags.list.title,
            tab: "expenses",
            form,
            expenseTags: await this._expenseTagsRepository.getAllAsync()
        });
    }
}