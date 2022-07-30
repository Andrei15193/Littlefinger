import { tables } from "../table-storage";
import { ExpensesDataCollection } from "./ExpensesDataCollection";

export class DataStorage {
    public constructor(userId: string) {
        this.expenses = new ExpensesDataCollection(userId, tables.expenses);
    }

    public readonly expenses: ExpensesDataCollection;
}