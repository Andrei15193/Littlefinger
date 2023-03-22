export interface IExpenseTagRenameRequest {
    readonly userId: string;
    readonly initialExpenseTagName: string;
    readonly newExpenseTagName: string;
}