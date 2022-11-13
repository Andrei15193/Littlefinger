import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { createHandlebarsInstance } from "./Handlebars";
import { pages } from "./pages";
import { DependencyContainer } from "./dependencyContainer/DependencyContainer";
import { AzureStorageManager } from "./data/azureStorage/AzureStorageManager";
import { AzureStorage } from "./data/azureStorage/AzureStorage";
import { config } from "./config";
import { SessionServiceMock } from "./services/mock/SessionServiceMock";
import { ExpressPage } from "./ExpressPage";

(async function startApplicationAsync(): Promise<void> {
    console = new console.Console({
        stdout: process.stdout,
        stderr: process.stderr,
        groupIndentation: 4
    });

    const args = readCommandLineArguments(process.argv);

    const AzureTableStorageConnectionString = config.connectionStrings.azureStorage

    const azureStorageManager = new AzureStorageManager(new AzureStorage(AzureTableStorageConnectionString));
    await azureStorageManager.ensureTableStorageAsync({
        recreateTables: args.flags["recreate-tables"],
        deleteExtraTables: args.flags["delete-extra-tables"]
    });
    await azureStorageManager.ensureQueueStorageAsync({
        clearQueues: args.flags["clear-queues"]
    });

    const handlebars = createHandlebarsInstance(path.join(__dirname, "views"));
    const app = express()
        .engine("hbs", handlebars.__express)
        .set("view engine", "hbs")
        .set("views", path.join(__dirname, "views"))
        .set("view options", { layout: "layouts/default" })
        .use(express.static(path.join(__dirname, "assets")))
        .use(express.urlencoded({ extended: true }))
        .use(cookieParser(config.http.cookieSecret));

    const dependencyReplacements: Partial<Omit<DependencyContainer, "user">> = {
        sessionService: args.flags["use-default-user"]
            ? new SessionServiceMock({
                id: "00000000-0000-0000-0000-000000000000",
                user: {
                    id: "00000000-0000-0000-0000-000000000000",
                    displayName: "Andrei",
                    defaultCurrency: "RON"
                },
                expiration: new Date()
            })
            : undefined
    };
    pages.forEach(page => {
        const expressPage = new ExpressPage(page, dependencyReplacements);
        expressPage.register(app);
    });

    if (config.http.port !== undefined)
        app.listen(config.http.port, () => console.log(`[server]: Server is running at http://localhost:${config.http.port}`));
    else
        app.listen();
})();

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