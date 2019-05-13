import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import forkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
import * as htmlWebpackPlugin from "html-webpack-plugin";
import cleanOutputPlugin from "clean-webpack-plugin";
import * as copyWebpackPlugin from "copy-webpack-plugin";
import * as path from "path";

type WebpackEnv = {
	production?: boolean;
};

const FORCE_IE11_TARGET = false;

const createConfig = ({
	production
}: WebpackEnv = {}): webpack.Configuration => {
	production = Boolean(production);
	const basePath = __dirname;
	const publicPath = path.join(basePath, "src", "public");
	const templatePath = path.join(basePath, "src", "index.html");

	const createBabelOptions = ({ classes = true } = {}) => ({
		presets: [
			"@babel/preset-typescript",
			[
				"@babel/preset-react",
				{
					development: !production
				}
			],
			[
				"@babel/preset-env",
				{
					modules: production ? false : "commonjs",
					useBuiltIns: "usage",
					targets: {
						browsers:
							production || FORCE_IE11_TARGET
								? ["ie 11"]
								: ["last 2 Chrome versions"]
					}
				}
			]
		].filter(Boolean),
		plugins: [
			[
				"babel-plugin-styled-components",
				{
					displayName: !production,
					fileName: !production,
					preproccess: false,
					minify: false,
					transpileTemplateLiterals: false
				}
			],
			"@babel/plugin-proposal-class-properties",
			!classes && "@babel/plugin-transform-classes",
			"@babel/plugin-proposal-object-rest-spread",
			"@babel/plugin-syntax-dynamic-import",
			"react-hot-loader/babel"
		].filter(Boolean)
	});

	const devServer: webpackDevServer.Configuration = {
		port: 3000,
		stats: "errors-only",
		host: "0.0.0.0",
		publicPath: "/",
		hot: true,
		contentBase: publicPath
	};

	const plugins: webpack.Plugin[] = [
		new htmlWebpackPlugin({
			template: templatePath || path.join(__dirname, "src/index.html")
		})
	];

	if (!production) {
		plugins.push(
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NamedModulesPlugin(),
			new webpack.NamedChunksPlugin()
		);
	} else {
		plugins.push(
			new webpack.HashedModuleIdsPlugin(),
			new cleanOutputPlugin(),
			new copyWebpackPlugin([{ from: publicPath, to: "." }])
		);
	}

	return {
		entry: path.join(basePath, "src/index.tsx"),
		mode: production ? "production" : "development",
		plugins,
		output: {
			path: path.join(basePath, "dist"),
			filename: `${production ? "[name].[chunkhash]" : "[name]"}.js`,
			chunkFilename: `${production ? "[id].[chunkhash]" : "[id]"}.js`,
			publicPath: "./",
			pathinfo: false
		},
		resolve: {
			extensions: [".ts", ".tsx", ".js"],
			modules: [
				path.join(basePath, "src"),
				path.join(basePath, "node_modules")
			]
		},
		module: {
			rules: [
				{
					test: /.js$/,
					loader: {
						loader: "babel-loader",
						options: {
							cacheDirectory: true,
							...createBabelOptions({ classes: false })
						}
					}
				},
				{
					test: /.tsx?$/,
					loader: {
						loader: "babel-loader",
						options: {
							cacheDirectory: true,
							...createBabelOptions()
						}
					}
				},
				{
					test: /\.(png|jpg|gif|svg)$/,
					use: [
						{
							loader: "file-loader",
							options: {}
						}
					]
				}
			]
		},
		stats: "minimal",
		devServer,
		devtool: production ? false : "eval"
	};
};

export = createConfig;
