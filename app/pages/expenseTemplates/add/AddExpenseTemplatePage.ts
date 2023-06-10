import type { IFormQueryHandlerDefinition, IFormCommandHandlerDefinition, FormType } from "../../page";
import type { IExpenseTemplateFormViewOptions } from "../IExpenseTemplateFormViewOptions";
import type { IExpenseTemplatePageRequestFormBody } from "../IExpenseTemplatePageRequestFormBody";
import { ExpenseTemplateForm } from "../ExpenseTemplateForm";
import { FormPage } from "../../page";
import { GetBlankExpenseTemplateQueryHandler } from "./queries/GetBlankExpenseTemplateQueryHandler";
import { AddExpenseTemplateCommandHandler } from "./commands/AddExpenseTemplateCommandHandler";
import { AddExpenseTemplateTagCommandHandler } from "./commands/AddExpenseTemplateTagCommandHandler";
import { RemoveExpenseTemplateTagCommandHandler } from "./commands/RemoveExpenseTemplateTagCommandHandler";

export class AddExpenseTemplatePage extends FormPage<ExpenseTemplateForm, {}, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions> {
    public readonly route: string = "/expense-templates/add";

    public readonly formType: FormType<ExpenseTemplateForm> = ExpenseTemplateForm;

    public handlers: [IFormQueryHandlerDefinition<ExpenseTemplateForm, {}, IExpenseTemplateFormViewOptions>, ...IFormCommandHandlerDefinition<ExpenseTemplateForm, {}, IExpenseTemplatePageRequestFormBody, IExpenseTemplateFormViewOptions>[]] = [
        {
            handlerType: GetBlankExpenseTemplateQueryHandler
        },
        {
            name: "add",
            handlerType: AddExpenseTemplateCommandHandler
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