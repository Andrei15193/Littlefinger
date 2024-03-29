import type { IEnvironmentTranslationLabels, ISiteTranslationTabels, ITranslation } from "./translations/Translation";
import type { IExpenseWarning, IExpenseTagWarning, IExpenseShopWarning } from "./model/Expenses";
import fs from "fs";
import hbs from "hbs";
import Markdown from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import path from "path";
import { Enum } from "./global/Enum";
import { ExpenseTagColor } from "./model/Expenses";
import { EnvironmentType } from "./config";

type IHandlebars = ReturnType<typeof hbs.create>;

const integerFormatOptions: Intl.NumberFormatOptions = {
    notation: "standard",
    maximumFractionDigits: 0
};

const floatFormatOptions: Intl.NumberFormatOptions = {
    notation: "standard",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
};

export function createHandlebarsInstance(viewsDirectoryPath: string): IHandlebars {
    const markdownParser = new Markdown();
    markdownParser.configure("commonmark");
    markdownParser.options.html = false;
    markdownParser.use(markdownItAttrs, {
        allowedAttributes: ["id", "class", "target", "title"]
    });

    const handlebars: IHandlebars = hbs.create();

    handlebars.registerHelper("markdown", function (this: any, text: string) {
        return text === undefined || text === null ? undefined : markdownParser.renderInline(text);
    });

    handlebars.registerHelper("markdownBlock", function (this: any, text: string) {
        return text === undefined || text === null ? undefined : markdownParser.render(text);
    });

    handlebars.registerHelper("call", function (this: any, callback: Function, ...args: readonly any[]): unknown {
        return callback(...args);
    });

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

    handlebars.registerHelper("formatFormNumber", function (this: any, locale: string, value?: number): string {
        return value?.toLocaleString(locale, { useGrouping: false, notation: "standard" }) || "";
    });

    handlebars.registerHelper("getLeadingZeros", function (this: any, locale: string, value: number, integerDigitsCount?: number): string {
        if (locale === undefined || locale === null || typeof locale !== "string")
            throw new Error("getLeadingZeros expects a locale, but none was provided.");

        const significantIntegerDigits = value.toLocaleString(locale, integerFormatOptions);

        const oneAsString = (1).toLocaleString(locale, integerFormatOptions);
        const zeroAsString = (0).toLocaleString(locale, integerFormatOptions);
        const zerosTemplate = Number("1" + "0".repeat(integerDigitsCount! - 1)).toLocaleString(locale, integerFormatOptions).replace(oneAsString, zeroAsString);

        return zerosTemplate.substring(0, zerosTemplate.length - significantIntegerDigits.length);
    });
    handlebars.registerHelper("formatNumber", function (this: any, locale: string, value?: number): string {
        if (locale === undefined || locale === null || typeof locale !== "string")
            throw new Error("formatNumber expects a locale, but none was provided.");

        return value?.toLocaleString(locale, floatFormatOptions) || "";
    });
    handlebars.registerHelper("formatIntegerNumber", function (this: any, locale: string, value?: number): string {
        if (locale === undefined || locale === null || typeof locale !== "string")
            throw new Error("formatIntegerNumber expects a locale, but none was provided.");

        return value?.toLocaleString(locale, integerFormatOptions) || "";
    });

    handlebars.registerHelper("toInputDateValue", function (this: any, date: Date): string {
        return date?.toISOString().split("T")[0] || "";
    });
    handlebars.registerHelper("formatDate", function (this: any, locale: string, date: Date): string {
        if (locale === undefined || locale === null || typeof locale !== "string")
            throw new Error("formatDate expects a locale, but none was provided.");

        return date?.toLocaleDateString(locale) || "";
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

    handlebars.registerHelper("expenseWarning", function (this: any, translation: ITranslation, expenseWarning: IExpenseWarning) {
        const translationLabelOrSelector: string | ((...args: readonly any[]) => string) = translation.expenses.warnings[expenseWarning.key];
        if (typeof translationLabelOrSelector === "string")
            return translationLabelOrSelector;
        else
            return translationLabelOrSelector.apply(translation.expenses.warnings, expenseWarning.arguments as any[]);
    });

    handlebars.registerHelper("expenseTagWarning", function (this: any, translation: ITranslation, expenseTagWarning: IExpenseTagWarning) {
        const translationLabelOrSelector: string | ((...args: readonly any[]) => string) = translation.expenseTags.warnings[expenseTagWarning.key];
        if (typeof translationLabelOrSelector === "string")
            return translationLabelOrSelector;
        else
            return translationLabelOrSelector.apply(translation.expenses.warnings, expenseTagWarning.arguments as any[]);
    });

    handlebars.registerHelper("expenseShopWarning", function (this: any, translation: ITranslation, expenseShopWarning: IExpenseShopWarning) {
        const translationLabelOrSelector: string | ((...args: readonly any[]) => string) = translation.expenseShops.warnings[expenseShopWarning.key];
        if (typeof translationLabelOrSelector === "string")
            return translationLabelOrSelector;
        else
            return translationLabelOrSelector.apply(translation.expenses.warnings, expenseShopWarning.arguments as any[]);
    });

    handlebars.registerHelper("expenseTagColorKey", function (this: any, expenseTagColor: ExpenseTagColor): string {
        return Enum.getKey(ExpenseTagColor, expenseTagColor)!;
    });

    handlebars.registerHelper("environmentNameTranslation", function (this: any, translation: ITranslation, { name: environmentName }: { readonly name: keyof ISiteTranslationTabels["environments"] }): string {
        return (translation.site.environments[environmentName] as IEnvironmentTranslationLabels).name;
    });

    handlebars.registerHelper("environmentDescriptionTranslation", function (this: any, translation: ITranslation, { name: environmentName }: { readonly name: keyof ISiteTranslationTabels["environments"] }): string | null {
        return (translation.site.environments[environmentName] as IEnvironmentTranslationLabels).description;
    });

    handlebars.registerHelper("environmentTypeColorClass", function (this: any, environmentType: EnvironmentType): string | null {
        switch (environmentType) {
            case EnvironmentType.Development:
                return "text-info";

            case EnvironmentType.Test:
                return "text-success";

            default:
                return null;
        }
    });

    return handlebars;
}