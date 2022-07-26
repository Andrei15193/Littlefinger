import hbs from "hbs";

export const handlebars = hbs.create();

handlebars.registerHelper("ifCompare", function (this: any, arg1: any, operator: string, arg2: any, options) {
    return compare(arg1, operator, arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper("unlessCompare", function (this: any, arg1: any, operator: string, arg2: any, options) {
    return !compare(arg1, operator, arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper("toInputDateValue", function (this: any, date: Date): string {
    return date?.toISOString().split("T")[0] || "";
});
handlebars.registerHelper("formatDate", function (this: any, date: Date): string {
    return date?.toLocaleDateString() || "";
});

function compare(arg1: any, operator: string, arg2: any): boolean {
    switch (operator) {
        case "==":
            return arg1 == arg2;

        case "===":
            return arg1 === arg2;

        case "!=":
            return arg1 != arg2;

        case "!==":
            return arg1 !== arg2;

        case "<":
            return arg1 < arg2;

        case "<=":
            return arg1 <= arg2;

        case ">":
            return arg1 > arg2;

        case ">=":
            return arg1 >= arg2;

        default:
            throw new Error(`Unknown ${operator} operator.`);
    }
}