import type { IFormBody } from "../forms";
import type { IDependencyContainer } from "../../dependencyContainer/index";
import type { IFormField } from "../forms/index";
import type { IExpenseTagsRepository } from "../../data/repositories/expenses/IExpenseTagsRepository";
import type { ICurrenciesRepository } from "../../data/repositories/expenses/ICurrenciesRepository";
import type { IExpenseShopsRepository } from "../../data/repositories/expenses/IExpenseShopsRepository";
import type { IExpenseShop, IExpenseTag } from "../../model/Expenses";
import type { WithoutEtag } from "../../model/Common";
import { ExpenseTagColor } from "../../model/Expenses";
import { Form, RequiredTextFormField, RequiredIntegerFormField, RequiredDecimalFormField, RequiredDateFormField, RequiredMultiSelectTextField } from "../forms";
import { Enum } from "../../global/Enum";

export class ExpenseForm extends Form {
    private _expenseTagsByName: Record<string, WithoutEtag<IExpenseTag>>;
    private readonly _currenciesRepository: ICurrenciesRepository;
    private readonly _expenseTagsRepository: IExpenseTagsRepository;
    private readonly _expenseShopsRepository: IExpenseShopsRepository;

    public constructor({ translation, currenciesRepository, expenseShopsRepository, expenseTagsRepository }: IDependencyContainer) {
        super();
        this._expenseTagsByName = {};
        this._currenciesRepository = currenciesRepository;
        this._expenseShopsRepository = expenseShopsRepository;
        this._expenseTagsRepository = expenseTagsRepository;
        this.fields = [
            this.name = new RequiredTextFormField("name", translation?.expenses.form.name.error.required),
            this.shop = new RequiredTextFormField<IExpenseShop>("shop", translation?.expenses.form.shop.error.required),
            this.tags = new RequiredMultiSelectTextField<WithoutEtag<IExpenseTag>>("tags", translation?.expenses.form.tags.error.required),
            this.price = new RequiredDecimalFormField("price", translation?.expenses.form.price.error.required),
            this.currency = new RequiredTextFormField("currency", translation?.expenses.form.currency.error.required),
            this.quantity = new RequiredIntegerFormField("quantity", translation?.expenses.form.quantity.error.required),
            this.date = new RequiredDateFormField("date", translation?.expenses.form.date.error.required)
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

    public readonly fields: readonly IFormField<any, any>[];

    public get expenseTagsByName(): Record<string, WithoutEtag<IExpenseTag>> {
        return this._expenseTagsByName;
    }

    public override async loadAsync(formBody: IFormBody): Promise<void> {
        await super.loadAsync(formBody);

        this.shop.options = await this._expenseShopsRepository.getAllAsync();
        this.currency.options = await this._currenciesRepository.getAllAsync();
        this.tags.options = await this._expenseTagsRepository.getAllAsync();

        const expenseTagColors = Enum.getAllValues(ExpenseTagColor);
        this._expenseTagsByName = await this._expenseTagsRepository.getAllByNameAsync();

        this.tags.value.forEach(tagName => {
            if (!(tagName in this._expenseTagsByName)) {
                this._expenseTagsByName[tagName] = {
                    name: tagName,
                    color: expenseTagColors[Math.floor(Math.random() * 1000) % expenseTagColors.length]!,
                }
            }
        });
    }
}