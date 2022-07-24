import type { Express } from "express";
import type { IExpenseEntity } from "../../data/IExpenseEntity";
import type { ExcludeFormNullValues, IFormField } from "../forms";
import { v4 as uuid } from "uuid";
import { tables } from "../../table-storage";
import { tabs } from "../../tabs";

interface IExpensePostRequestBody {
    readonly name: string;
    readonly shop: string;
    readonly tags: string | readonly string[];
    readonly price: number;
    readonly currency: string;
    readonly quantity: number;
    readonly date: string;
}

interface IExpenseCreateForm {
    readonly name: IFormField<string>;
    readonly shop: IFormField<string>;
    readonly tags: IFormField<readonly string[]>;
    readonly price: IFormField<number | null | undefined>;
    readonly currency: IFormField<string>;
    readonly quantity: IFormField<number>;
    readonly date: IFormField<Date | null | undefined>
}

export function registerHandlers(app: Express): void {
    app.get("/expenses/add", (req, res) => {
        res.render("expenses/add", {
            title: "Add Expense",
            tab: tabs.expenses,
            previousTags: ["tag1", "tag2"],
            previousCurrencies: ["RON", "EUR"],
            form: ({
                name: { value: "" },
                shop: { value: "" },
                tags: { value: [] },
                price: { value: undefined },
                currency: { value: res.locals.user.defaultCurrency || "" },
                quantity: { value: 1 },
                date: { value: new Date().toISOString().split("T")[0] }
            } as IExpenseCreateForm)
        });
    });

    app.post("/expenses/add", async (req, res) => {
        const form = readForm(req.body as IExpensePostRequestBody);

        if (validate(form)) {
            const expenseMonth = form.date.value.toISOString().substring(0, "YYYY-MM".length);
            const partitionKey = `${res.locals.user.id}-${expenseMonth}`
            const expenseId = uuid();

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

            res.redirect("/expenses");
        }
        else
            res.render("expenses/add", {
                title: "Add Expense",
                tab: tabs.expenses,
                validated: true,
                form
            });
    });
}

function readForm(body: IExpensePostRequestBody): IExpenseCreateForm {
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

function validate(form: IExpenseCreateForm): form is ExcludeFormNullValues<IExpenseCreateForm> {
    let isFormValid = true;

    if (form.name.value.length === 0) {
        form.name.error = "Please provide a name for the expense that you have made";
        isFormValid = false;
    }
    if (form.shop.value.length === 0) {
        form.shop.error = "Please provide the name of the shop where you made your purchase";
        isFormValid = false;
    }
    if (form.tags.value.length === 0) {
        form.tags.error = "Please provide at least one tag (useful when generating reports)";
        isFormValid = false;
    }
    if (form.price.value === null || form.price.value === undefined || Number.isNaN(form.price.value) || form.price.value <= 0 || !Number.isInteger(form.price.value * 100)) {
        form.price.error = "Please provide a price that is greater than zero and has at most two decimals";
        isFormValid = false;
    }
    if (form.currency.value.length === 0) {
        form.currency.error = "Please provide the currency in which you made the purchase";
        isFormValid = false;
    }
    if (!Number.isInteger(form.quantity.value) || form.quantity.value <= 0) {
        form.quantity.error = "Please provide the quantity which must be an integer greater than zero";
        isFormValid = false;
    }
    if (form.date.value === null) {
        form.date.error = "Please provide the date when you made the purchase";
        isFormValid = false;
    }

    return isFormValid;
}