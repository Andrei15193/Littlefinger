import type { Configuration } from "webpack";
import type { HtmlTagObject } from 'html-webpack-plugin';
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from "terser-webpack-plugin";

export const webAppConfiguration: Configuration = {
    name: "webApp",
    target: "node",
    mode: "development",
    entry: path.join(__dirname, "app", "index.ts"),
    output: {
        path: path.join(__dirname, "out", "app"),
        publicPath: "{{ publicPath }}",
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
                            "**/layouts/base.hbs"
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
            template: path.join(__dirname, "app", "views", "layouts", "base.hbs"),
            filename: path.join("views", "layouts", "base.hbs"),
            favicon: path.join(__dirname, "app", "assets", "favicon.ico"),
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
                            headTags: mapTag(assetTags.headTags.concat(assetTags.bodyTags.filter(tag => tag.tagName.localeCompare("script", "en-GB", { sensitivity: "base" }) === 0))),
                            bodyTags: mapTag(assetTags.bodyTags.filter(tag => tag.tagName.localeCompare("script", "en-GB", { sensitivity: "base" }) !== 0))
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
                                switch (tag.attributes.rel) {
                                    case "stylesheet":
                                        return {
                                            ...tag,
                                            attributes: {
                                                ...tag.attributes,
                                                href: mapFileReferenceHtmlAttribute(tag.attributes.href),
                                                type: "text/css",
                                                crossorigin: "anonymous",
                                                ["data-preload"]: "true"
                                            }
                                        };

                                    case "icon":
                                        return {
                                            ...tag,
                                            attributes: {
                                                ...tag.attributes,
                                                href: mapFileReferenceHtmlAttribute(tag.attributes.href),
                                                type: "image/x-icon",
                                                crossorigin: "anonymous",
                                                ["data-preload"]: "true"
                                            }
                                        };

                                    default:
                                        return {
                                            ...tag,
                                            attributes: {
                                                ...tag.attributes,
                                                href: mapFileReferenceHtmlAttribute(tag.attributes.href)
                                            }
                                        };
                                }

                            case "script":
                                return {
                                    ...tag,
                                    attributes: {
                                        ...tag.attributes,
                                        src: mapFileReferenceHtmlAttribute(tag.attributes.src),
                                        type: "application/javascript",
                                        crossorigin: "anonymous",
                                        ["data-preload"]: "true"
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
};