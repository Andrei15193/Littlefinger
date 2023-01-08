import type { IDependencyContainer } from "../../dependencyContainer/index";
import type { IFormField } from ".";
import type { IExpenseTagsRepository } from "../../data/repositories/expenses/IExpenseTagsRepository";
import type { ICurrenciesRepository } from "../../data/repositories/expenses/ICurrenciesRepository";
import type { IExpenseShopsRepository } from "../../data/repositories/expenses/IExpenseShopsRepository";
import type { WithoutEtag } from "../../model/Common";
import type { IExpenseShop, IExpenseTag } from "../../model/Expenses";
import { Form, RequiredTextFormField, RequiredIntegerFormField, RequiredDecimalFormField, RequiredDateFormField, RequiredMultiSelectTextField } from ".";

export class ExpenseForm extends Form {
    private readonly _currenciesRepository: ICurrenciesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, currenciesRepository, expenseShopsRepository, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._currenciesRepository = currenciesRepository;
        this._expenseShopsRepository = expenseShopsRepository;
        this._expenseTagsRepository = expenseTagsRepository;
        this.fields = [
            this.name = new RequiredTextFormField("name", translation.expenses.form.name.error.required),
            this.shop = new RequiredTextFormField<IExpenseShop>("shop", translation.expenses.form.shop.error.required),
            this.tags = new RequiredMultiSelectTextField<WithoutEtag<IExpenseTag>>("tag", translation.expenses.form.tags.error.required),
            this.price = new RequiredDecimalFormField("price", translation.expenses.form.price.error.required),
            this.currency = new RequiredTextFormField("currency", translation.expenses.form.currency.error.required),
            this.quantity = new RequiredIntegerFormField("quantity", translation.expenses.form.quantity.error.required),
            this.date = new RequiredDateFormField("date", translation.expenses.form.date.error.required)
        ];

        this.tags.maximumItemLimit = 25;
    }

    public readonly name: RequiredTextFormField;

    public readonly shop: RequiredTextFormField<IExpenseShop>;

    public readonly tags: RequiredMultiSelectTextField<WithoutEtag<IExpenseTag>>;

    public readonly price: RequiredDecimalFormField;

    public readonly currency: RequiredTextFormField;

    public readonly quantity: RequiredIntegerFormField;

    public readonly date: RequiredDateFormField;

    public fields: readonly IFormField<any, any>[];

    public async loadOptionsAsync(): Promise<void> {
        this.shop.options = await this._expenseShopsRepository.getAllAsync();
        this.currency.options = await this._currenciesRepository.getAllAsync();
        this.tags.options = await this._expenseTagsRepository.getAllAsync();
    }
}