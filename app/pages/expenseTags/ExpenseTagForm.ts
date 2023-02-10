import type { IDependencyContainer } from "../../dependencyContainer/index";
import type { IFormBody, IFormField } from "../forms/index";
import type { IExpenseTag } from "../../model/Expenses";
import { Form, RequiredTextFormField, RequiredMultiSelectTextField } from "../forms";

export class ExpenseTagForm extends Form {
    private _expenseTags: readonly IExpenseTag[];

    public constructor({ translation }: IDependencyContainer) {
        super();

        this.fields = [
            this.initialName = new RequiredTextFormField("initialName", translation.expenseTags.update.confirmation.name.error.required),
            this.newName = new RequiredTextFormField("newName", translation.expenseTags.update.confirmation.name.error.required),
            this.color = new RequiredMultiSelectTextField<IExpenseTag>("color", translation.expenseTags.update.confirmation.color.error.required)
        ];

        this._expenseTags = [];
    }

    public readonly initialName: RequiredTextFormField;

    public readonly newName: RequiredTextFormField;

    public readonly color: RequiredMultiSelectTextField<IExpenseTag>;

    public readonly fields: readonly IFormField<any, any>[];

    public get expenseTags(): readonly IExpenseTag[] {
        return this._expenseTags;
    }

    public override async loadAsync(formBody: IFormBody): Promise<void> {
        await super.loadAsync(formBody);
    }
}