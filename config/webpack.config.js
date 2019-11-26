const path = require('path');

const webpack = require('webpack');
//* 将css文件单独打包 *//
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//** 删除上次打包的文件 *//
const CleanWebpackPlugin = require("clean-webpack-plugin");
//* 输出html静态文件 *//
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');

let config = {
	//mode : 'production',

	//* 设置上下文 *//
	context: path.resolve(__dirname, '../'),

	//* 入口文件 *//
	entry : {
		selectdown : './src/index.ts'
	},

	//* 出口文件 *//
	output : {
		filename : '[name].js',
		path : path.resolve(__dirname, '../dist/js'),
		//publicPath : '',
		library: "selectDown"
	},
	resolve : {
		extensions : ['.js', '.json', '.ts']
	},
	module : {
		rules : [
			{  //* 引用 css样式的loader *//
				test : /\.css$/,
				use : ExtractTextPlugin.extract({
					fallback: "style-loader",
          			use: ["css-loader"]
				})
			},
			{  //* 引用 css样式的loader *//
				test : /\.scss$/,
				use : ExtractTextPlugin.extract({
					fallback: "style-loader",
          			use: ["css-loader", "sass-loader"]
				})
			},
			{ //* 引用文件的loader *//
				test : /\.(png|jpg|gif|jpeg)$/,
				use : [{
					loader : 'url-loader',
					options : {
						limit : 5000,
						outputPath : '../images',
						name : '[name].[hash:5].[ext]',
					}
				}]
			},
			{
                test: /(\.woff)|(\.ttf)|(\.eot)|(\.svg)|(\.woff2)$/,
                use:{
                    loader: 'file-loader',
                    options:{
                        name: '[path][name].[ext]',
                        outputPath: '',
                        publicPath: ''
                    }
                }
            },
			{
				test : /\.html$/,
				use : [{
					loader: 'html-loader',
					options: {
					  minimize: false
					}
				}],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test : /\.tsx?$/,
				use : 'ts-loader'
				
			}
		]
	},
	plugins : [
		new CleanWebpackPlugin(),
		new ExtractTextPlugin("../style/[name].css"),
		new webpack.optimize.UglifyJsPlugin(),
		new HtmlWebpackPlugin({
			template : 'index.html',
			filename: '../index.html',
			
		}),
		new CopyWebpackPlugin([
            {
                from: __dirname + '/../src/assets',
                to: __dirname + '/../dist',
                ignore: ['.*']
            }
        ])
	]
}


webpack(config, err => {
	console.log(err)
})