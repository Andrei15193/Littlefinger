export class ExpensesUtils {
    public static getExpenseMonth(date: Date): string {
        return date.toISOString().substring(0, "YYYY-MM".length);
    }
}