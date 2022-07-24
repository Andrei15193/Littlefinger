import express from "express";
import path from "path";
import { handlebars } from "./app/handlebars";
import { registerHandlers } from "./app/requestHandlers";
import { ensureTableStorageAsync } from "./app/table-storage";
import { tabs } from "./app/tabs";

(async function startApplicationAsync(): Promise<void> {
    const app = express();
    Object.assign(app.locals, {
        application: {
            name: "LittleFinger",
            tabs
        }
    });

    const args = readCommandLineArguments(process.argv);
    const port: number | undefined = args.named.port !== undefined ? Number(args.named.port) : undefined;

    handlebars.registerPartials(path.join(process.cwd(), "views", "partials"));
    handlebars.localsAsTemplateData(app);

    app
        .engine("hbs", handlebars.__express)
        .set("view engine", "hbs")
        .set("views", path.join(process.cwd(), "app", "views"))
        .set("view options", { layout: "layouts/default" })
        .use(express.static(path.join(process.cwd(), "app", "assets")))
        .use(express.urlencoded({ extended: true }))
        .use((req, res, next) => {
            res.locals = {
                user: {
                    id: "00000000-0000-0000-0000-000000000000",
                    username: "andrei15193",
                    displayName: "Andrei",
                    defaultCurrency: "RON"
                }
            };
            next();
        });
    registerHandlers(app);

    await ensureTableStorageAsync({
        recreateTables: args.flags["recreate-tables"],
        deleteExtraTables: args.flags["delete-extra-tables"]
    });

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