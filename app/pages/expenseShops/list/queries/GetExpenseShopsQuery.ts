import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results";
import type { IExpenseShopsRepository } from "../../../../data/repositories/expenses/IExpenseShopsRepository";
import type { IListExpenseShopsRouteParams, IListExpenseShopsViewOptions } from "../ListExpenseShopsPageDefinition";
import { BasicQueryHandler } from "../../../page";

export class GetExpenseShopsQueryHandler extends BasicQueryHandler<IListExpenseShopsRouteParams, IListExpenseShopsViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, expenseShopsRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseShopsRepository = expenseShopsRepository;
    }

    public async executeQueryAsync(): Promise<IRequestResult> {
        let expenseShops = [...await this._expenseShopsRepository.getAllAsync()].sort((left, right) => left.name.localeCompare(right.name, "en-GB", { sensitivity: "base" }));
        expenseShops = expenseShops.concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops).concat(expenseShops);

        return this.render("expenseShops/list", {
            title: this._translation.expenseShops.list.title,
            tab: "expenses",
            expenseShops
        });
    }
}