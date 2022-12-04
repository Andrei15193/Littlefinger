import type { Configuration } from "webpack";
import fs from "fs";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";

const functionNames = fs
    .readdirSync(__dirname)
    .filter(directoryName => fs.existsSync(path.join(__dirname, directoryName, "function.json")) && fs.existsSync(path.join(__dirname, directoryName, "index.ts")));

export const functionsAppConfiguration: Configuration = {
    name: "functionsApp",
    target: "node",
    mode: "development",
    entry: functionNames.reduce<Record<string, string>>(
        (result, functionName) => {
            result[path.join("functions", functionName, "index")] = path.join(__dirname, functionName, "index.ts");
            return result;
        },
        {}
    ),
    output: {
        path: path.join(__dirname, "out"),
        filename: "[name].js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: path.join(__dirname, "tsconfig.json")
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "host.json", to: "functions" },
                ...functionNames.map(functionName => ({
                    from: path.join(__dirname, functionName, "function.json"),
                    to: path.join("functions", functionName),
                    transform(contents: any) {
                        return JSON.stringify(Object.assign(JSON.parse(contents), { scriptFile: "./index.js" }), undefined, 2);
                    }
                }))
            ]
        })
    ]
};