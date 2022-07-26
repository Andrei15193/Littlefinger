import type { RestError } from "@azure/data-tables"
import type { Express } from "express";
import type { IExpenseForm } from "./form";
import type { IExpenseEntity } from "../../data/IExpenseEntity";
import { validate } from "./form";
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
    readonly etag: string;
}

interface IExpenseUpdateForm extends IExpenseForm {
    readonly etag: string;
}

function title(expenseId: string): string {
    return `Edit Expense ${expenseId}`;
}
const tab = tabs.expenses;

export function registerHandlers(app: Express): void {
    app.get("/expenses/:id", async (req, res) => {
        const { id: expenseId } = req.params;
        const { user: { id: userId } } = res.locals;

        const expenseEntity = await tables.expenses.getEntity<IExpenseEntity>(`${userId}-2022-07`, expenseId);

        res.render("expenses/detail", {
            title: title(expenseId),
            tab,
            previousTags: ["tag1", "tag2"],
            previousCurrencies: ["RON", "EUR"],
            validated: false,
            form: ({
                name: { value: expenseEntity.name },
                shop: { value: expenseEntity.shop },
                tags: { value: JSON.parse(expenseEntity.tags) },
                price: { value: expenseEntity.price },
                currency: { value: expenseEntity.currency },
                quantity: { value: expenseEntity.quantity },
                date: { value: expenseEntity.date },
                etag: expenseEntity.etag
            } as IExpenseForm)
        });
    });

    app.post("/expenses/:id", async (req, res) => {
        const { id: expenseId } = req.params;
        const { user: { id: userId } } = res.locals;
        const form = readForm(req.body as IExpenseFormRequestBody);

        if (validate(form)) {
            const expenseMonth = form.date.value.toISOString().substring(0, "YYYY-MM".length);
            const partitionKey = `${userId}-${expenseMonth}`

            try {
                await tables.expenses.updateEntity<IExpenseEntity>(
                    {
                        partitionKey,
                        rowKey: expenseId,
                        name: form.name.value,
                        shop: form.shop.value,
                        tags: JSON.stringify(form.tags.value),
                        currency: form.currency.value,
                        price: form.price.value,
                        quantity: form.quantity.value,
                        date: form.date.value
                    },
                    "Replace",
                    { etag: form.etag }
                );

                res.redirect("/expenses");
            }
            catch (error) {
                const { statusCode } = error as RestError;
                if (statusCode === 412)
                    res.render("expenses/detail", {
                        title: title(expenseId),
                        tab,
                        validated: true,
                        formError: "The expense has already been edited",
                        form
                    });
                else
                    res.render("expenses/detail", {
                        title: title(expenseId),
                        tab,
                        validated: true,
                        formError: "An unknown error has occurred, please retry the operation",
                        form
                    });
            }
        }
        else
            res.render("expenses/detail", {
                title: title(expenseId),
                tab,
                validated: true,
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
            value: body.currency?.trim() || ""
        },
        quantity: {
            value: Number(body.quantity)
        },
        date: {
            value: body.date ? new Date(body.date) : null
        },
        etag: body.etag || ""
    };
}