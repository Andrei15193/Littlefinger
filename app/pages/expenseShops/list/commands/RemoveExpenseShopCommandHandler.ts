import type { IDependencyContainer } from "../../../../dependencyContainer/index";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results/index";
import type { IExpenseShopsRepository } from "../../../../data/repositories/expenses/IExpenseShopsRepository";
import type { IListExpenseShopsRouteParams, IListExpenseShopsViewOptions, IModifyExpenseShopsRequestBody } from "../ListExpenseShopsPageDefinition";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { BasicCommandHandler } from "../../../page/index";

export class RemoveExpenseShopCommandHandler extends BasicCommandHandler<IListExpenseShopsRouteParams, IModifyExpenseShopsRequestBody, IListExpenseShopsViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, expenseShopsRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseShopsRepository = expenseShopsRepository;
    }

    public async executeCommandAsync(routeParams: {}, { name, etag }: IModifyExpenseShopsRequestBody): Promise<IRequestResult> {
        try {
            await this._expenseShopsRepository.getByNameAsync(name);

            await this._expenseShopsRepository.removeAsync(name, etag);

            const expenseShops = [...await this._expenseShopsRepository.getAllAsync()].sort((left, right) => left.name.localeCompare(right.name, "en-GB", { sensitivity: "base" }));

            return this.render("expenseShops/list", {
                title: this._translation.expenseShops.list.title,
                tab: "expenses",
                expenseShops
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;

            const expenseShops = [...await this._expenseShopsRepository.getAllAsync()].sort((left, right) => left.name.localeCompare(right.name, "en-GB", { sensitivity: "base" }));
            return dataStorageError.map({
                notFound: this.render("expenseShops/list", {
                    title: this._translation.expenseShops.list.title,
                    tab: "expenses",
                    expenseShops,
                    errorMessage: this._translation.expenseShops.delete.errors.notFound
                }),
                invalidEtag: this.render("expenseShops/list", {
                    title: this._translation.expenseShops.list.title,
                    tab: "expenses",
                    expenseShops,
                    errorMessage: this._translation.expenseShops.delete.errors.invalidEtag
                }),
                get unknown(): IRequestResult {
                    throw error;
                }
            });
        }
    }
}