import type { Express } from "express";
import type { IExpenseForm } from "./form";
import { validate } from "./form";
import { tabs } from "../../tabs";
import { DataStorage } from "../../data/DataStorage";

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
    app.get("/expenses/:month(\\d{4}-\\d{2})?/add", (req, res) => {
        const { params: { month: routeMonth, } } = req;

        res.render("expenses/add", {
            title,
            tab,
            route: {
                month: routeMonth
            },
            previousTags: ["tag1", "tag2"],
            previousCurrencies: ["RON", "EUR"],
            form: ({
                name: { value: "" },
                shop: { value: "" },
                tags: { value: [] },
                price: { value: undefined },
                currency: { value: res.locals.user.defaultCurrency || "" },
                quantity: { value: 1 },
                date: { value: routeMonth === null || routeMonth === undefined ? new Date() : new Date(routeMonth) }
            } as IExpenseForm)
        });
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})?/add", async (req, res) => {
        const { params: { month: routeMonth, } } = req;
        const { locals: { user: { id: userId } } } = res;
        const dataStorage = new DataStorage(userId);

        const form = readForm(req.body as IExpenseFormRequestBody);
        if (validate(form)) {
            try {
                await dataStorage.expenses.addAsync({
                    name: form.name.value,
                    shop: form.shop.value,
                    tags: form.tags.value,
                    price: form.price.value,
                    currency: form.currency.value,
                    quantity: form.quantity.value,
                    date: form.date.value
                });
                res.redirect("/expenses");
            }
            catch {
                res.render("expenses/detail", {
                    title,
                    tab,
                    route: {
                        month: routeMonth
                    },
                    validated: true,
                    formError: "An unknown error has occurred, please reload the page and retry the operation",
                    form
                });
            }
        }
        else
            res.render("expenses/add", {
                title,
                tab,
                route: {
                    month: routeMonth
                },
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
            value: body.currency?.trim().toUpperCase() || ""
        },
        quantity: {
            value: Number(body.quantity)
        },
        date: {
            value: body.date ? new Date(body.date) : null
        }
    };
}