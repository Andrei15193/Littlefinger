import type { IDependencyContainer } from "../../../../dependencyContainer/index";
import type { ITranslation } from "../../../../translations/Translation";
import type { IRequestResult } from "../../../page/results/index";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IListExpenseTagsRouteParams, IListExpenseTagsViewOptions, IModifyExpenseTagsRequestBody } from "../ListExpenseTagsPageDefinition";
import type { ExpenseTagForm } from "../../ExpenseTagForm";
import type { DataStorageError } from "../../../../data/DataStorageError";
import { FormCommandHandler } from "../../../page/index";

export class EditExpenseTagCommandHandler extends FormCommandHandler<ExpenseTagForm, IListExpenseTagsRouteParams, IModifyExpenseTagsRequestBody, IListExpenseTagsViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expenseTagsRepository }: IDependencyContainer) {
        super();

        this._translation = translation;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeCommandAsync(form: ExpenseTagForm): Promise<IRequestResult> {
        try {
            form.validate();
            if (form.isValid) {
                const expenseTag = await this._expenseTagsRepository.getByNameAsync(form.initialName.value!);
                if (expenseTag.state !== "ready") {
                    form.error = this._translation.expenseTags.edit.errors.notEditable;
                    return this.render("expenseTags/list", {
                        title: this._translation.expenseTags.list.title,
                        tab: "expenses",
                        form,
                        expenseTags: await this._expenseTagsRepository.getAllAsync()
                    });
                }

                await this._expenseTagsRepository.updateAsync(form.initialName.value!, form.etag!, {
                    name: form.newName.value!,
                    color: form.color.value!
                });
            }

            return this.render("expenseTags/list", {
                title: this._translation.expenseTags.list.title,
                tab: "expenses",
                form,
                expenseTags: await this._expenseTagsRepository.getAllAsync()
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;

            form.error = dataStorageError.map({
                notFound: this._translation.expenseTags.edit.errors.notFound,
                invalidEtag: this._translation.expenseTags.edit.errors.invalidEtag,
                targetNotReady: this._translation.expenseTags.edit.errors.targetNotReady,
                get unknown(): string {
                    throw error;
                }
            });

            return this.render("expenseTags/list", {
                title: this._translation.expenseTags.list.title,
                tab: "expenses",
                form,
                expenseTags: await this._expenseTagsRepository.getAllAsync()
            });
        }
    }
}