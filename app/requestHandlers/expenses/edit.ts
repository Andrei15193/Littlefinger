import type { Express } from "express";
import type { IForm, IEditForm } from "../forms";
import type { IExpenseForm } from "./form";
import type { IApplicationTabs } from "../../applicationTabs";
import { IFormError, ITranslation } from "../../translations/translation";
import type { DataStorageError } from "../../data/DataStorageError";
import { fillOptionsAsync, validate } from "./form";
import { getExpenseMonth } from "../../data/DataStorageHelpers";
import { DataStorage } from "../../data/DataStorage";

interface IExpenseFormRequestBody {
    readonly validated: "true" | "false";
    readonly etag: string;

    readonly name: string;
    readonly shop: string;
    readonly tags: string | readonly string[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: string;
}

export function registerHandlers(app: Express): void {
    app.get("/expenses/:month(\\d{4}-\\d{2})/:id/edit", async (req, res) => {
        const { params: { month: expenseMonth = "", id: expenseId = "" } } = req;
        const userId: string = res.locals.user.id;
        const translation: ITranslation = res.locals.translation;
        const tabs: IApplicationTabs = res.locals.tabs;

        const dataStorage = new DataStorage(userId);

        try {
            const expenseEntity = await dataStorage.expenses.getAsync(expenseMonth, expenseId);
            const form: IEditForm<IExpenseForm> = {
                isValidated: false,
                isValid: true,
                isInvalid: false,

                name: { value: expenseEntity.name },
                shop: { value: expenseEntity.shop },
                tags: { value: expenseEntity.tags },
                price: { value: expenseEntity.price },
                currency: { value: expenseEntity.currency },
                quantity: { value: expenseEntity.quantity },
                date: { value: expenseEntity.date },
                etag: expenseEntity.etag
            };
            await fillOptionsAsync(form);

            res.render("expenses/edit", {
                title: translation.expenses.edit.title(expenseId),
                tab: tabs.expenses,
                route: req.params,
                form
            });
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            res.render("expenses/edit-not-found", {
                title: translation.expenses.edit.title(expenseId),
                tab: tabs.expenses,
                route: req.params,
                form: {
                    isValidated: false,
                    isValid: false,
                    isInvalid: true,
                    error: dataStorageError.map<IFormError>({
                        "Not Found": translation.expenses.form.error.notFound(expenseMonth),
                        "Unknown": translation.expenses.form.error.unknown
                    })
                } as IForm
            });
        }
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})/:id/edit", async (req, res) => {
        const { params: { month: expenseMonth = "", id: expenseId = "" } } = req;
        const userId: string = res.locals.user.id;
        const translation: ITranslation = res.locals.translation;
        const tabs: IApplicationTabs = res.locals.tabs;

        const dataStorage = new DataStorage(userId);

        const form = readForm(translation, req.body as IExpenseFormRequestBody);
        if (validate(translation, form))
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
                form.error = dataStorageError.map({
                    "Invalid etag": translation.expenses.form.error.invalidEtag,
                    "Unknown": translation.expenses.form.error.unknown
                })
                await fillOptionsAsync(form);

                res.render("expenses/edit", {
                    title: translation.expenses.edit.title(expenseId),
                    tab: tabs.expenses,
                    route: req.params,
                    form
                });
            }
        else {
            await fillOptionsAsync(form);
            res.render("expenses/edit", {
                title: translation.expenses.edit.title(expenseId),
                tab: tabs.expenses,
                route: req.params,
                form
            });
        }
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})/:id/delete", async (req, res) => {
        const { params: { month: expenseMonth = "", id: expenseId = "" } } = req;
        const userId: string = res.locals.user.id;
        const translation: ITranslation = res.locals.translation;
        const tabs: IApplicationTabs = res.locals.tabs;

        const dataStorage = new DataStorage(userId);

        const form = readForm(translation, req.body as IExpenseFormRequestBody);
        try {
            await dataStorage.expenses.deleteAsync(expenseMonth, expenseId, form.etag);
            res.redirect(`/expenses/${expenseMonth}`);
        }
        catch (error) {
            const dataStorageError = error as DataStorageError;
            form.error = dataStorageError.map({
                "Invalid etag": translation.expenses.form.error.invalidEtag,
                "Unknown": translation.expenses.form.error.unknown
            })
            await fillOptionsAsync(form);

            dataStorageError.handle({
                "Not Found": () => res.redirect(`/expenses/${expenseMonth}`),
                "Unknown": () => res.render("expenses/edit", {
                    title: translation.expenses.edit.title(expenseId),
                    tab: tabs.expenses,
                    route: req.params,
                    form
                })
            });
        }
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})/:id/add-tag", async (req, res) => {
        const { params: { id: expenseId = "" } } = req;
        const translation: ITranslation = res.locals.translation;
        const tabs: IApplicationTabs = res.locals.tabs;

        const form = readForm(translation, req.body as IExpenseFormRequestBody);
        fillOptionsAsync(form);
        form.tags.value = [""].concat(form.tags.value);
        if (form.isValidated)
            validate(translation, form);

        res.render("expenses/edit", {
            title: translation.expenses.edit.title(expenseId),
            tab: tabs.expenses,
            route: req.params,
            form
        });
    });

    app.post("/expenses/:month(\\d{4}-\\d{2})/:id/remove-tag", async (req, res) => {
        const { params: { id: expenseId = "" } } = req;
        const { query: { tag } } = req;
        const translation: ITranslation = res.locals.translation;
        const tabs: IApplicationTabs = res.locals.tabs;

        const form = readForm(translation, req.body as IExpenseFormRequestBody);
        fillOptionsAsync(form);
        form.tags.value = form.tags.value.filter(existingTag => tag !== existingTag);
        if (form.isValidated)
            validate(translation, form);

        res.render("expenses/edit", {
            title: translation.expenses.edit.title(expenseId),
            tab: tabs.expenses,
            route: req.params,
            form
        });
    });
}

function readForm(translation: ITranslation, body: IExpenseFormRequestBody): IEditForm<IExpenseForm> {
    const form: IEditForm<IExpenseForm> = {
        isValidated: body.validated === "true",
        isValid: true,
        isInvalid: false,

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
        etag: body.etag || ""
    };

    if (form.isValidated)
        validate(translation, form);

    return form;
}