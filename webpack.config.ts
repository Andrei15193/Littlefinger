import type { Configuration } from "webpack";
import type { HtmlTagObject } from 'html-webpack-plugin';
import fs from "fs";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from "terser-webpack-plugin";

const functionNames = fs
    .readdirSync(__dirname)
    .filter(directoryName => fs.existsSync(path.join(__dirname, directoryName, "function.json")) && fs.existsSync(path.join(__dirname, directoryName, "index.ts")));

const config: readonly Configuration[] = [
    {
        name: "webapp",
        target: "node",
        mode: "development",
        entry: path.join(__dirname, "app", "index.ts"),
        output: {
            path: path.join(__dirname, "out", "app"),
            publicPath: "/",
            filename: "index.js",
            libraryTarget: "commonjs"
        },
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                handlebars: 'handlebars/dist/handlebars.min.js'
            }
        },
        optimization: {
            minimizer: [
                // This resolves production build issues, see https://github.com/node-fetch/node-fetch/issues/784
                new TerserPlugin({
                    terserOptions: {
                        mangle: {
                            keep_classnames: /AbortSignal/,
                            keep_fnames: /AbortSignal/
                        }
                    }
                }),
            ],
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
                },
                {
                    test: /\.(scss)$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins() {
                                        return [
                                            require("autoprefixer")
                                        ];
                                    }
                                }
                            }
                        },
                        "sass-loader"
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: path.join("assets", "style.css")
            }),
            new CopyPlugin({
                patterns: [
                    {
                        context: path.join(__dirname, "app"),
                        from: "views/**/*.hbs",
                        globOptions: {
                            ignore: [
                                "**/layouts/default.hbs"
                            ]
                        }
                    },
                    {
                        context: path.join(__dirname, "app"),
                        from: "assets/*.*",
                        globOptions: {
                            ignore: [
                                "**/*.scss"
                            ]
                        }
                    },
                    {
                        context: path.join(__dirname, "node_modules", "bootstrap", "dist", "js"),
                        from: "bootstrap.bundle.min.js",
                        to: "assets",
                        toType: "dir"
                    }
                ]
            }),
            new HtmlWebpackPlugin({
                inject: false,
                template: path.join(__dirname, "app", "views", "layouts", "default.hbs"),
                filename: path.join("views", "layouts", "default.hbs"),
                hash: true,
                minify: false,
                scriptLoading: "blocking",
                templateParameters(compilation, assets, assetTags, options) {
                    return {
                        compilation,
                        webpackConfig: compilation.options,
                        htmlWebpackPlugin: {
                            tags: {
                                ...assetTags,
                                headTags: mapTag(assetTags.headTags),
                                bodyTags: mapTag(assetTags.bodyTags)
                            },
                            files: {
                                ...assets,
                                css: assets.css.map(mapFileReferenceHtmlAttribute),
                                js: assets.js.map(mapFileReferenceHtmlAttribute)
                            },
                            options
                        }
                    };

                    function mapTag(tags: readonly HtmlTagObject[]): readonly HtmlTagObject[] {
                        return tags.map(tag => {
                            switch (tag.tagName.toLowerCase()) {
                                case "link":
                                    return {
                                        ...tag,
                                        attributes: {
                                            ...tag.attributes,
                                            href: mapFileReferenceHtmlAttribute(tag.attributes.href)
                                        }
                                    };

                                case "script":
                                    return {
                                        ...tag,
                                        attributes: {
                                            ...tag.attributes,
                                            src: mapFileReferenceHtmlAttribute(tag.attributes.src)
                                        }
                                    };

                                default:
                                    return tag;
                            }
                        })
                    }

                    function mapFileReferenceHtmlAttribute(fileReference: string | boolean | undefined | null): string | boolean | undefined | null {
                        if (typeof fileReference === "string")
                            return decodeURI(fileReference).replace("index.js", "bootstrap.bundle.min.js").replace(/assets[/\\]/, "");

                        return fileReference;
                    }
                }
            })
        ]
    },
    {
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
    }
];

export default config;