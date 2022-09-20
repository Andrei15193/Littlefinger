import type { IExpensesRepository } from "../../../../data/repositories/expenses/IExpensesRepository";
import type { IExpenseTagsRepository } from "../../../../data/repositories/expenses/IExpenseTagsRepository";
import type { IDependencyContainer } from "../../../../dependencyContainer";
import type { ITranslation } from "../../../../translations/translation";
import type { IEditExpenseRouteParams } from "../EditExpensePageDefinition";
import type { IExpenseFormViewOptions } from "../../IExpenseFormViewOptions";
import type { IRequestResult } from "../../../page/results";
import type { DataStorageError } from "../../../../data/DataStorageError";
import type { IExpenseFormData } from "../../ExpenseForm";
import type { PageRequestBody } from "../../../page/IBasePageRequestBody";
import { CommandHandler } from "../../../page";
import { ExpenseForm } from "../../ExpenseForm";
import { AzureTableStorageUtils } from "../../../../data/repositories/AzureTableStorageUtils";

export class EditExpenseCommandHandler extends CommandHandler<IEditExpenseRouteParams, PageRequestBody<IExpenseFormData>, IExpenseFormViewOptions> {
    private readonly _translation: ITranslation;
    private readonly _expensesRepository: IExpensesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;

    public constructor({ translation, expensesRepository, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._translation = translation;
        this._expensesRepository = expensesRepository;
        this._expenseTagsRepository = expenseTagsRepository;
    }

    public async executeCommandAsync({ month: expenseMonth, id: expenseId }: IEditExpenseRouteParams, requestBody: PageRequestBody<IExpenseFormData>, queryParmas: {}): Promise<IRequestResult> {
        const form = await ExpenseForm.initializeAsync(requestBody, this._translation, this._expenseTagsRepository);
        form.validate();

        if (form.isValid)
            try {
                await this._expensesRepository.updateAsync({
                    key: {
                        month: expenseMonth,
                        id: expenseId
                    },
                    name: form.name.value!,
                    shop: form.shop.value!,
                    tags: form.tags.value,
                    price: form.price.value!,
                    currency: form.currency.value!,
                    quantity: form.quantity.value!,
                    date: form.date.value!,
                    etag: form.etag!
                });

                return this.redirect(`/expenses/${AzureTableStorageUtils.getExpenseMonth(form.date.value!)}`);
            }
            catch (error) {
                const dataStorageError = error as DataStorageError;
                form.error = dataStorageError.map({
                    invalidEtag: this._translation.expenses.form.error.invalidEtag,
                    unknown: this._translation.expenses.form.error.unknown
                });

                return this.render("expenses/edit", {
                    title: this._translation.expenses.edit.title(expenseId),
                    tab: "expenses",
                    form
                });
            }
        else {
            return this.render("expenses/edit", {
                title: this._translation.expenses.edit.title(expenseId),
                tab: "expenses",
                form
            });
        }
    }
}