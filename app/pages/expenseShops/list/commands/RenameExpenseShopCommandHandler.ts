import type { IDependencyContainer } from "../../../../dependencyContainer/index";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results/index";
import type { IExpenseShopsRepository } from "../../../../data/repositories/expenses/IExpenseShopsRepository";
import type { IListExpenseShopsRouteParams, IListExpenseShopsViewOptions, IModifyExpenseShopsRequestBody } from "../ListExpenseShopsPageDefinition";
import type { ExpenseShopForm } from "../../ExpenseShopForm";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { FormCommandHandler } from "../../../page/index";

export class RenameExpenseShopCommandHandler extends FormCommandHandler<ExpenseShopForm, IListExpenseShopsRouteParams, IModifyExpenseShopsRequestBody, IListExpenseShopsViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, expenseShopsRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseShopsRepository = expenseShopsRepository;
    }

    public async executeCommandAsync(form: ExpenseShopForm): Promise<IRequestResult> {
        try {
            form.validate();
            if (form.isValid) {
                const expenseShop = await this._expenseShopsRepository.getByNameAsync(form.initialName.value!);
                if (expenseShop.state !== "ready") {
                    form.error = this._translation.expenseShops.rename.errors.notEditable;
                    return this.render("expenseShops/list", {
                        title: this._translation.expenseShops.list.title,
                        tab: "expenses",
                        form,
                        expenseShops: await this._expenseShopsRepository.getAllAsync()
                    });
                }

                await this._expenseShopsRepository.renameAsync(form.initialName.value!, form.etag!, form.newName.value!);
            }

            return this.render("expenseShops/list", {
                title: this._translation.expenseShops.list.title,
                tab: "expenses",
                form,
                expenseShops: await this._expenseShopsRepository.getAllAsync()
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;

            form.error = dataStorageError.map({
                notFound: this._translation.expenseShops.rename.errors.notFound,
                invalidEtag: this._translation.expenseShops.rename.errors.invalidEtag,
                targetNotReady: this._translation.expenseShops.rename.errors.targetNotReady,
                get unknown(): string {
                    throw error;
                }
            });

            return this.render("expenseShops/list", {
                title: this._translation.expenseShops.list.title,
                tab: "expenses",
                form,
                expenseShops: await this._expenseShopsRepository.getAllAsync()
            });
        }
    }
}