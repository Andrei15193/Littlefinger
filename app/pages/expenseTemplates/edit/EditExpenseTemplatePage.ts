import type { IFormQueryHandlerDefinition, IFormCommandHandlerDefinition, FormType } from "../../page";
import type { IExpenseTemplateFormViewOptions } from "../IExpenseTemplateFormViewOptions";
import type { IExpenseTemplatePageRequestFormBody } from "../IExpenseTemplatePageRequestFormBody";
import { ExpenseTemplateForm } from "../ExpenseTemplateForm";
import { FormPage } from "../../page";
import { GetExpenseTemplateQueryHandler } from "./queries/GetExpenseTemplateQueryHandler";
import { EditExpenseTemplateCommandHandler } from "./commands/EditExpenseTemplateCommandHandler";
import { RemoveExpenseTemplateCommandHandler } from "./commands/RemoveExpenseTemplateCommandHandler";
import { AddExpenseTemplateTagCommandHandler } from "./commands/AddExpenseTemplateTagCommandHandler";
import { RemoveExpenseTemplateTagCommandHandler } from "./commands/RemoveExpenseTemplateTagCommandHandler";

export class EditExpenseTemplatePage extends FormPage<ExpenseTemplateForm, {}, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions> {
    public readonly route: string = "/expense-templates/:id";

    public readonly formType: FormType<ExpenseTemplateForm> = ExpenseTemplateForm;

    public handlers: [IFormQueryHandlerDefinition<ExpenseTemplateForm, {}, IExpenseTemplateFormViewOptions>, ...IFormCommandHandlerDefinition<ExpenseTemplateForm, {}, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions>[]] = [
        {
            handlerType: GetExpenseTemplateQueryHandler
        },
        {
            name: "edit",
            handlerType: EditExpenseTemplateCommandHandler
        },
        {
            name: "remove",
            handlerType: RemoveExpenseTemplateCommandHandler
        },
        {
            name: "add-tag",
            handlerType: AddExpenseTemplateTagCommandHandler
        },
        {
            name: "remove-tag",
            handlerType: RemoveExpenseTemplateTagCommandHandler
        }
    ];
}