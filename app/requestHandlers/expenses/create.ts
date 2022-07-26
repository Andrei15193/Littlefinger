import type { Express } from "express";
import type { IExpenseEntity } from "../../data/IExpenseEntity";
import type { IExpenseForm } from "./form";
import { validate } from "./form";
import { v4 as uuid } from "uuid";
import { tables } from "../../table-storage";
import { tabs } from "../../tabs";

interface IExpenseFormRequestBody {
    readonly name: string;
    readonly shop: string;
    readonly tags: string | readonly string[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: string;
}

const title = "Add Expense";
const tab = tabs.expenses;

export function registerHandlers(app: Express): void {
    app.get("/expenses/add", (req, res) => {
        res.render("expenses/add", {
            title,
            tab,
            previousTags: ["tag1", "tag2"],
            previousCurrencies: ["RON", "EUR"],
            form: ({
                name: { value: "" },
                shop: { value: "" },
                tags: { value: [] },
                price: { value: undefined },
                currency: { value: res.locals.user.defaultCurrency || "" },
                quantity: { value: 1 },
                date: { value: new Date() }
            } as IExpenseForm)
        });
    });

    app.post("/expenses/add", async (req, res) => {
        const { user: { id: userId } } = res.locals;
        const form = readForm(req.body as IExpenseFormRequestBody);

        if (validate(form)) {
            const expenseMonth = form.date.value.toISOString().substring(0, "YYYY-MM".length);
            const partitionKey = `${userId}-${expenseMonth}`
            const expenseId = uuid();

            try {
                await tables.expenses.createEntity<IExpenseEntity>({
                    partitionKey,
                    rowKey: expenseId,
                    name: form.name.value,
                    shop: form.shop.value,
                    tags: JSON.stringify(form.tags.value),
                    currency: form.currency.value,
                    price: form.price.value,
                    quantity: form.quantity.value,
                    date: form.date.value
                });
            }
            catch {
                res.render("expenses/detail", {
                    title,
                    tab,
                    validated: true,
                    formError: "An unknown error has occurred, please retry the operation",
                    form
                });
            }

            res.redirect("/expenses");
        }
        else
            res.render("expenses/add", {
                title,
                tab,
                validated: true,
                form
            });
    });
}

function readForm(body: IExpenseFormRequestBody): IExpenseForm {
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
            value: body.currency?.trim() || ""
        },
        quantity: {
            value: Number(body.quantity)
        },
        date: {
            value: body.date ? new Date(body.date) : null
        }
    };
}