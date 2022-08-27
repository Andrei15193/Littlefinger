import type { Express } from "express";
import { fillOptionsAsync, IExpenseForm } from "./form";
import { validate } from "./form";
import { tabs } from "../../tabs";
import { DataStorage } from "../../data/DataStorage";

interface IExpenseFormRequestBody {
    readonly validated: string;

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

        const form: IExpenseForm = {
            isValidated: false,
            isValid: true,
            isInvalid: false,

            name: { value: "" },
            shop: { value: "" },
            tags: {
                value: []
            },
            price: { value: undefined },
            currency: {
                value: res.locals.user.defaultCurrency || ""
            },
            quantity: { value: 1 },
            date: { value: routeMonth === null || routeMonth === undefined ? new Date() : new Date(routeMonth) }
        };
        fillOptionsAsync(form);

        res.render("expenses/add", {
            title,
            tab,
            route: req.params,
            form
        });
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})?/add", async (req, res) => {
        const { locals: { user: { id: userId } } } = res;
        const dataStorage = new DataStorage(userId);

        const form = readForm(req.body as IExpenseFormRequestBody);
        if (validate(form))
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
                form.error = "An unknown error has occurred, please reload the page and retry the operation";
                fillOptionsAsync(form);

                res.render("expenses/add", {
                    title,
                    tab,
                    route: req.params,
                    form
                });
            }
        else {
            fillOptionsAsync(form);

            res.render("expenses/add", {
                title,
                tab,
                route: req.params,
                form
            });
        }
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})?/add-tag", async (req, res) => {
        const form = readForm(req.body as IExpenseFormRequestBody);
        fillOptionsAsync(form);
        form.tags.value = [""].concat(form.tags.value);
        if (form.isValidated)
            validate(form);

        res.render("expenses/add", {
            title,
            tab,
            route: req.params,
            form
        });
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})?/remove-tag", async (req, res) => {
        const { query: { tag } } = req;

        const form = readForm(req.body as IExpenseFormRequestBody);
        fillOptionsAsync(form);
        form.tags.value = form.tags.value.filter(existingTag => tag !== existingTag);
        if (form.isValidated)
            validate(form)

        res.render("expenses/add", {
            title,
            tab,
            route: req.params,
            form
        });
    });
}

function readForm(body: IExpenseFormRequestBody): IExpenseForm {
    const form: IExpenseForm = {
        isValidated: body.validated === "true",
        isValid: true,
        isInvalid: false,

        name: { value: body.name?.trim() || "" },
        shop: { value: body.shop?.trim() || "" },
        tags: {
            value: (Array.isArray(body.tags) ? body.tags : [body.tags])
                .map((tag: string) => tag?.trim())
                .filter(tag => tag !== undefined && tag !== null && tag.length > 0)
                .reduce<string[]>(
                    (result, tag) => {
                        if (!result.includes(tag))
                            result.push(tag);

                        return result;
                    },
                    []
                )
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

    if (form.isValidated)
        validate(form);

    return form;
}