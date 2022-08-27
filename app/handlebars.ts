import fs from "fs";
import hbs from "hbs";
import path from "path";

type IHandlebars = ReturnType<typeof hbs.create>;

export function createHandlebarsInstance(viewsDirectoryPath: string): IHandlebars {
    const handlebars: IHandlebars = hbs.create();

    handlebars.registerHelper("ifCompare", function (this: any, arg1: any, operator: string, arg2: any, options) {
        return compare(arg1, operator, arg2) ? options.fn(this) : options.inverse(this);
    });
    handlebars.registerHelper("unlessCompare", function (this: any, arg1: any, operator: string, arg2: any, options) {
        return !compare(arg1, operator, arg2) ? options.fn(this) : options.inverse(this);
    });

    handlebars.registerHelper("ifOdd", function (this: any, value: number, options) {
        return value % 2 === 1 ? options.fn(this) : options.inverse(this);
    });
    handlebars.registerHelper("unlessOdd", function (this: any, value: number, options) {
        return value % 2 !== 1 ? options.fn(this) : options.inverse(this);
    });
    handlebars.registerHelper("ifEven", function (this: any, value: number, options) {
        return value % 2 === 0 ? options.fn(this) : options.inverse(this);
    });
    handlebars.registerHelper("unlessEven", function (this: any, value: number, options) {
        return value % 2 !== 0 ? options.fn(this) : options.inverse(this);
    });

    handlebars.registerHelper("getLeadingZeros", function (this: any, value: number, integerDigitsCount?: number): string {
        const significantIntegerDigits = value.toLocaleString(undefined);
        const completeIntegerDigits = value.toLocaleString(undefined, { minimumIntegerDigits: integerDigitsCount, minimumFractionDigits: 0 });

        return completeIntegerDigits.substring(0, completeIntegerDigits.length - significantIntegerDigits.length);
    });
    handlebars.registerHelper("formatNumber", function (this: any, value?: number): string {
        return value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "";
    });
    handlebars.registerHelper("formatIntegerNumber", function (this: any, value?: number): string {
        return value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "";
    });

    handlebars.registerHelper("toInputDateValue", function (this: any, date: Date): string {
        return date?.toISOString().split("T")[0] || "";
    });
    handlebars.registerHelper("formatDate", function (this: any, date: Date): string {
        return date?.toLocaleDateString() || "";
    });
    handlebars.registerHelper("formatISOYearMonth", function (this: any, date: Date): string {
        return date?.toISOString().substring(0, "YYYY-MM".length) || "";
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

    if (fs.existsSync(viewsDirectoryPath)) {
        const toVisit = [{ directoryPath: viewsDirectoryPath, prefix: "" }];
        do {
            const current = toVisit.shift()!;
            fs
                .readdirSync(current.directoryPath)
                .forEach(fileName => {
                    const directoryPath = path.join(current.directoryPath, fileName);
                    if (fs.statSync(directoryPath).isDirectory())
                        if (fileName.toLowerCase() === "partials")
                            registerPartials(handlebars, directoryPath, current.prefix);
                        else
                            toVisit.push({
                                directoryPath,
                                prefix: current.prefix === "" ? fileName : `${current.prefix}/${fileName}`
                            });
                });
        } while (toVisit.length > 0);

        function registerPartials(handlebars: IHandlebars, directoryPath: string, prefix?: string): void {
            const toVisit = [{ directoryPath, prefix }];
            do {
                const current = toVisit.shift()!;
                fs
                    .readdirSync(current.directoryPath)
                    .forEach(fileName => {
                        const filePath = path.join(current.directoryPath, fileName);
                        const partialName = current.prefix === "" ? fileName : `${current.prefix}/${fileName}`;
                        const fileStat = fs.statSync(filePath);
                        if (fileStat.isDirectory())
                            toVisit.push({
                                directoryPath: filePath,
                                prefix: partialName
                            });
                        else if (fileStat.isFile() && fileName.toLowerCase().endsWith(".hbs"))
                            handlebars.registerPartial(
                                partialName.substring(0, partialName.lastIndexOf(".")),
                                fs.readFileSync(filePath).toString()
                            );
                    });
            } while (toVisit.length > 0);
        }
    }

    return handlebars;
}