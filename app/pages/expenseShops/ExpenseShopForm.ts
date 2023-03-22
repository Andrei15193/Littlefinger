import type { IDependencyContainer } from "../../dependencyContainer/index";
import type { IFormBody, IFormField } from "../forms/index";
import type { IExpenseShop } from "../../model/Expenses";
import { Form, RequiredTextFormField } from "../forms";

export class ExpenseShopForm extends Form {
    private _expenseShops: readonly IExpenseShop[];

    public constructor({ translation }: IDependencyContainer) {
        super();

        this.fields = [
            this.initialName = new RequiredTextFormField("initialName", translation.expenseShops.rename.modal.name.error.required),
            this.newName = new RequiredTextFormField("newName", translation.expenseShops.rename.modal.name.error.required)
        ];

        this._expenseShops = [];
    }

    public readonly initialName: RequiredTextFormField;

    public readonly newName: RequiredTextFormField;

    public readonly fields: readonly IFormField<any, any>[];

    public get expenseShops(): readonly IExpenseShop[] {
        return this._expenseShops;
    }

    public override async loadAsync(formBody: IFormBody): Promise<void> {
        await super.loadAsync(formBody);
    }
}