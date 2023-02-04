import type { IDependencyContainer } from "../../../../dependencyContainer/index";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results/index";
import type { IListExpenseShopsRouteParams, IListExpenseShopsViewOptions } from "../ListExpenseShopsPageDefinition";
import type { IExpenseShopsRepository } from "../../../../data/repositories/expenses/IExpenseShopsRepository";
import type { ExpenseShopForm } from "../../ExpenseShopForm";
import { FormQueryHandler } from "../../../page/index";

export class GetExpenseShopsQueryHandler extends FormQueryHandler<ExpenseShopForm, IListExpenseShopsRouteParams, IListExpenseShopsViewOptions> {
    private readonly _translation: ITranslation;
    private _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, expenseShopsRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseShopsRepository = expenseShopsRepository;
    }

    public async executeQueryAsync(form: ExpenseShopForm): Promise<IRequestResult> {
        return this.render("expenseShops/list", {
            title: this._translation.expenseShops.list.title,
            tab: "expenses",
            form,
            expenseShops: await this._expenseShopsRepository.getAllAsync()
        });
    }
}