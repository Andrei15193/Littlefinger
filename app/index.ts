import type { IUser } from "./model/Users";
import type { ITranslation } from "./translations/translation";
import express from "express";
import path from "path";
import { createHandlebarsInstance } from "./handlebars";
import { pages } from "./pages";
import { ensureTableStorageAsync } from "./table-storage";
import { translations } from "./translations";
import { DependencyContainer } from "./dependencyContainer/DependencyContainer";

(async function startApplicationAsync(): Promise<void> {
    const args = readCommandLineArguments(process.argv);
    const port: number | undefined = args.named.port !== undefined ? Number(args.named.port) : undefined;

    const AzureTableStorageConnectionString = (process.env as any).CUSTOMCONNSTR_AZURE_STORAGE;

    await ensureTableStorageAsync({
        recreateTables: args.flags["recreate-tables"],
        deleteExtraTables: args.flags["delete-extra-tables"]
    });

    const handlebars = createHandlebarsInstance(path.join(process.cwd(), "app", "views"));

    const app = express()
        .engine("hbs", handlebars.__express)
        .set("view engine", "hbs")
        .set("views", path.join(process.cwd(), "app", "views"))
        .set("view options", { layout: "layouts/default" })
        .use(express.static(path.join(process.cwd(), "app", "assets")))
        .use(express.urlencoded({ extended: true }))
        .use((req, res, next) => {
            // Would be retrieved from JWT, for now it's a fake user (works for development as well)
            const user: IUser = {
                id: "00000000-0000-0000-0000-000000000000",
                username: "andrei15193",
                displayName: "Andrei",
                defaultCurrency: "RON"
            };

            const responseLocale = req.acceptsLanguages(...translations.map(translation => translation.locale)) || translations[0]?.locale;
            const translation: ITranslation = translations.filter(translation => translation.locale === responseLocale)[0]!;
            const dependencyContainer = new DependencyContainer(user, AzureTableStorageConnectionString, translation);
            (res as { -readonly [propertyName in keyof Pick<typeof res, "dependencies">]: (typeof res)[propertyName] }).dependencies = dependencyContainer;

            next();
        });
    pages.forEach(page => page.register(app));

    if (port !== undefined)
        app.listen(port, () => console.log(`[server]: Server is running at http://localhost:${port}`));
    else
        app.listen();

    interface ICommandLineArguments {
        readonly flags: Record<string, boolean>;
        readonly named: Record<string, string>;
        readonly positional: string[];
    }

    function readCommandLineArguments(args: readonly string[]): ICommandLineArguments {
        let key: string | undefined = undefined;
        const commandLineArguments = args.reduce<ICommandLineArguments>(
            (result, value) => {
                if (value.startsWith("--") && value.length > 2) {
                    if (key !== undefined)
                        result.flags[key] = true;
                    key = value.substring(2);
                }
                else if (key !== undefined) {
                    result.named[key] = value;
                    key = undefined;
                }
                else
                    result.positional.push(value);
                return result;
            },
            { flags: {}, named: {}, positional: [] }
        )
        if (key !== undefined)
            commandLineArguments.flags[key] = true;

        return commandLineArguments;
    }
})();