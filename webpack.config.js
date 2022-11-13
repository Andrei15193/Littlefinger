const fs = require("fs");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const functionNames = fs
    .readdirSync(__dirname)
    .filter(directoryName => fs.existsSync(path.join(__dirname, directoryName, "function.json")) && fs.existsSync(path.join(__dirname, directoryName, "index.ts")));

module.exports = {
    target: "node",
    mode: "development",
    entry: functionNames.reduce(
        (result, funcitonName) => {
            result[path.join("functions", funcitonName, "index")] = path.join(__dirname, funcitonName, "index.ts");
            return result;
        },
        { [path.join("app", "index")]: path.join(__dirname, "app", "index.ts") }
    ),
    output: {
        path: path.join(__dirname, "out"),
        filename: "[name].js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js'
        }
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
                "app/views/**/*.hbs",
                "app/assets/*.*",
                { from: "host.json", to: "functions" },
                ...functionNames.map(functionName => ({
                    from: path.join(__dirname, functionName, "function.json"),
                    to: path.join("functions", functionName),
                    transform: contents => {
                        const functionInfo = JSON.parse(contents);
                        functionInfo.scriptFile = "./index.js"
                        return JSON.stringify(functionInfo, undefined, 2);
                    }
                }))
            ]
        })
    ]
}