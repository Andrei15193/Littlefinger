import type { IDependencyContainer } from "../../dependencyContainer/index";
import type { IFormBody, IFormField } from "../forms/index";
import type { IExpenseTag } from "../../model/Expenses";
import { ExpenseTagColor } from "../../model/Expenses";
import { Form, RequiredTextFormField, RequiredIntegerFormField } from "../forms";
import { Enum } from "../../global/Enum";

export class ExpenseTagForm extends Form {
    private _expenseTags: readonly IExpenseTag[];

    public constructor({ translation }: IDependencyContainer) {
        super();

        this.fields = [
            this.initialName = new RequiredTextFormField("initialName", translation.expenseTags.edit.modal.name.error.required),
            this.newName = new RequiredTextFormField("newName", translation.expenseTags.edit.modal.name.error.required),
            this.color = new RequiredIntegerFormField<ExpenseTagColor>("color", translation.expenseTags.edit.modal.color.error.required)
        ];

        this.color.minimumNumber = 0;

        this._expenseTags = [];
    }

    public readonly initialName: RequiredTextFormField;

    public readonly newName: RequiredTextFormField;

    public readonly color: RequiredIntegerFormField<ExpenseTagColor>;

    public readonly fields: readonly IFormField<any, any>[];

    public get expenseTags(): readonly IExpenseTag[] {
        return this._expenseTags;
    }

    public override async loadAsync(formBody: IFormBody): Promise<void> {
        await super.loadAsync(formBody);
        this.color.options = Enum.getAllValues(ExpenseTagColor);
    }
}