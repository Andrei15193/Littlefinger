import type { IDependencyContainer } from "../../../../dependencyContainer/index";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results/index";
import type { IListExpenseTemplatesRouteParams, IListExpenseTemplatesViewOptions } from "../ListExpenseTemplatesPageDefinition";
import type { IExpenseTemplatesRepository } from "../../../../data/repositories/expenses/IExpenseTemplatesRepository";
import { BasicQueryHandler } from "../../../page/index";

export class GetExpenseTemplatesQueryHandler extends BasicQueryHandler<IListExpenseTemplatesRouteParams, IListExpenseTemplatesViewOptions> {
    private readonly _translation: ITranslation;
    private _expenseTemplatesRepository: IExpenseTemplatesRepository;

    public constructor({ translation, expenseTemplatesRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseTemplatesRepository = expenseTemplatesRepository;
    }

    public async executeQueryAsync(): Promise<IRequestResult> {
        return this.render("expenseTemplates/list", {
            title: this._translation.expenseTemplates.list.title,
            tab: "expenses",
            expenseTemplates: await this._expenseTemplatesRepository.getAllAsync()
        });
    }
}