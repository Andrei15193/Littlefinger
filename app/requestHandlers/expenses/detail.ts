import type { Express } from "express";
import type { IExpenseForm } from "./form";
import type { DataStorageError } from "../../data/DataStorageError";
import { validate } from "./form";
import { tabs } from "../../tabs";
import { getExpenseMonth } from "../../data/DataStorageHelpers";
import { DataStorage } from "../../data/DataStorage";

interface IExpenseFormRequestBody {
    readonly name: string;
    readonly shop: string;
    readonly tags: string | readonly string[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: string;
    readonly etag: string;
    readonly deleteFlag: string;
}

interface IExpenseUpdateForm extends IExpenseForm {
    readonly etag: string;
    readonly deleteFlag: boolean;
}

function title(expenseId: string): string {
    return `Edit Expense ${expenseId}`;
}
const tab = tabs.expenses;

export function registerHandlers(app: Express): void {
    app.get("/expenses/:month(\\d{4}-\\d{2})/:id", async (req, res) => {
        const { params: { month: expenseMonth = "", id: expenseId = "" } } = req;
        const { locals: { user: { id: userId } } } = res;

        const dataStorage = new DataStorage(userId);

        try {
            const expenseEntity = await dataStorage.expenses.getAsync(expenseMonth, expenseId);
            res.render("expenses/detail", {
                title: title(expenseId),
                tab,
                previousTags: ["tag1", "tag2"],
                previousCurrencies: ["RON", "EUR"],
                expenseMonth,
                validated: false,
                form: ({
                    name: { value: expenseEntity.name },
                    shop: { value: expenseEntity.shop },
                    tags: { value: expenseEntity.tags, },
                    price: { value: expenseEntity.price },
                    currency: { value: expenseEntity.currency },
                    quantity: { value: expenseEntity.quantity },
                    date: { value: expenseEntity.date },
                    etag: expenseEntity.etag
                } as IExpenseForm)
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            res.render("expenses/detail", {
                title: title(expenseId),
                tab,
                expenseMonth,
                validated: false,
                notFound: dataStorageError.reason === "Not Found",
                formError: dataStorageError.toString({
                    "Not Found": "The expense you are trying to view does not exist",
                    "Unknown": "An unknown error has occurred, please reload the page and retry the operation"
                })
            });
        }
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})/:id", async (req, res) => {
        const { params: { month: expenseMonth = "", id: expenseId = "" } } = req;
        const { locals: { user: { id: userId } } } = res;

        const dataStorage = new DataStorage(userId);

        const form = readForm(req.body as IExpenseFormRequestBody);
        if (form.deleteFlag)
            try {
                await dataStorage.expenses.deleteAsync(expenseMonth, expenseId, form.etag);
                res.redirect(`/expenses/${expenseMonth}`);
            }
            catch (error) {
                const dataStorageError = error as DataStorageError;
                dataStorageError.handle({
                    "Not Found": () => res.redirect("/expenses"),
                    "Unknown": () => res.render("expenses/detail", {
                        title: title(expenseId),
                        tab,
                        expenseMonth,
                        validated: false,
                        formError: dataStorageError.toString({
                            "Invalid etag": "The expense has been edited",
                            "Unknown": "An unknown error has occurred, please reload the page and retry the operation"
                        }),
                        form
                    })
                });
            }
        else if (validate(form))
            try {
                await dataStorage.expenses.updateAsync(expenseMonth, expenseId, {
                    name: form.name.value,
                    shop: form.shop.value,
                    tags: form.tags.value,
                    price: form.price.value,
                    currency: form.currency.value,
                    quantity: form.quantity.value,
                    date: form.date.value,
                    etag: form.etag
                });
                res.redirect(`/expenses/${getExpenseMonth(form.date.value)}`);
            }
            catch (error) {
                const dataStorageError = error as DataStorageError;
                res.render("expenses/detail", {
                    title: title(expenseId),
                    tab,
                    validated: true,
                    expenseMonth,
                    formError: dataStorageError.toString({
                        "Invalid etag": "The expense has already been edited",
                        "Unknown": "An unknown error has occurred, please reload the page and retry the operation"
                    }),
                    form
                });
            }
        else
            res.render("expenses/detail", {
                title: title(expenseId),
                tab,
                validated: true,
                expenseMonth,
                form
            });
    });
}

function readForm(body: IExpenseFormRequestBody): IExpenseUpdateForm {
    return {
        name: { value: body.name?.trim() || "" },
        shop: { value: body.shop?.trim() || "" },
        tags: {
            value: (Array.isArray(body.tags) ? body.tags : [body.tags])
                .filter(tag => tag !== undefined && tag !== null)
                .map((tag: string) => tag.trim())
                .filter(tag => tag.length > 0)
                .sort()
        },
        price: {
            value: Number(body.price)
        },
        currency: {
            value: body.currency?.trim().toUpperCase() || ""
        },
        quantity: {
            value: Number(body.quantity)
        },
        date: {
            value: body.date ? new Date(body.date) : null
        },
        etag: body.etag || "",
        deleteFlag: Boolean(body.deleteFlag)
    };
}