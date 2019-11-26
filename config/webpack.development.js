const path = require('path');
const webpack = require('webpack');

//* 输出html静态文件 *//
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	//devloop : 'eval',
	//* 设置上下文 *//
	context: path.resolve(__dirname, '../'),

	//* 入口文件 *//
	entry : {
		main : './src/index.ts'
	},

	//* 出口文件 *//
	output : {
		filename : '[name].[hash].js',
		path : path.resolve(__dirname, 'dist/js/')
	},
	resolve : {
		extensions : ['.js', '.json', '.ts']
	},
	//* 防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖 *//
	externals : {

	},
	module : {
		rules : [
			{  //* 引用 css样式的loader *//
				test : /\.css$/,
				use : ["style-loader", "css-loader"]
				
			},
			{  //* 引用 css样式的loader *//
				test : /\.scss$/,
				use : ["style-loader", "css-loader", "sass-loader"]
			},
			{ //* 引用文件的loader *//
				test : /\.(png|jpg|gif|jpeg)$/,
				use : [{
					loader : 'url-loader',
					options : {
						limit : 5000,
						outputPath : './images',
						name : '[name].[hash:5].[ext]',
					}
				}]
			},
			{
				test : /\.html$/,
				use : [{
					loader: 'html-loader',
					options: {
					  minimize: true
					}
				}],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
                test: /(\.woff)|(\.ttf)$/,
                use:{
                    loader: 'file-loader',
                    options:{
                        name: '[path][name]_[hash].[ext]',
                        outputPath: '',
                        publicPath: ''
                    }
                }
            },
			{
				test : /\.tsx?$/,
				use : 'ts-loader'
				
			},
		]
	},
	plugins : [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(), 
		new webpack.NoEmitOnErrorsPlugin(),
		new HtmlWebpackPlugin({
			template : 'index.html',
			//title: 'webpack template',
      		filename: 'index.html'
		}),
	],
	devServer : {
		contentBase : false, // path.join(__dirname, 'dist'),
		compress : true,     // 一切服务都启用gzip 压缩：
		port : 9000,
		clientLogLevel : 'warning',  // 当使用内联模式(inline mode)时，在开发工具(DevTools)的控制台(console)将显示消息
		historyApiFallback: true,  // 当使用 HTML5 History API 时，任意的 404 响应都被替代为 index.html
		hot : true, // 启用 webpack 的模块热替换特性
		//watchContentBase : true,
		open: true,
		overlay: true, // 当存在编译器错误或警告时，在浏览器中显示全屏覆盖。默认情况下禁用
		publicPath : '/',  // 此路径下的打包文件可在浏览器中访问
		quiet: true,
		host : '127.0.0.1',
		watchOptions: {
			poll: true
		}
	}
}