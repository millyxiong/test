const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers/base-helpers.js');
const isProduction = process.env.NODE_ENV === 'prod';
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HappyPack = require('happypack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const config = {
    cache:true,
    detool:'source-map',
    context:helpers.root(),

    module:{
        rules:[
            {test:/\.html/,loader:'raw-loader'},
            {
                test:/\.css$/,
                use:[
                    'to-string-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            minimize: true
                        }
                    },
                ],
                exclude:[
                    helpers.root('node_modules/@avenueui/core'),
                    helpers.root('node_modules/@avenueui/devcloud/icomoon'),
                    helpers.root('src/frameworks/assets/')
                ]
            },
            {
                test:/\.css$/,
                use: isProduction ? ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use:[
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true
                            }
                        }
                    ]
                }) : [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: true
                        }
                    }
                ],
                include: [
                    helpers.root('node_modules/@avenueui/core'),
                    helpers.root('node_modules/@avenueui/devcloud/icomoon'),
                    helpers.root('src/frameworks/assets/')
                ]
            },
            {
                test: /\.js$/,
                include: [
                    helpers.root('node_modules/autotrack'),
                    helpers.root('node_modules/dom-utils'),
                ],
                use:[
                    {
                        loader: 'babel-loader',
                    }
                ]
            },
            {
                test:/\.(jpg|png|gif)$/,
                loader:'file-loader',
                query:{
                    name:'[path][hash].[ext]',
                    emitFile:true,
                    context:helpers.root('src')
                }
            },
            {
                test:/\.(eof|woff|woff2|svg|ttf|eot)$/,
                loader:'file-loader',
                query:{
                    name:'[hash].[ext]',
                    publicPath: 'app/codecheck/',
                    outputPath: 'app/codecheck/',
                    emitFile:true,
                    context:helpers.root('src')
                }
            }
        ]
    },

    resolve:{
        extensions:['.ts','.js','.json']
    },

    plugins:[
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['vendor', 'main'],
        }),
        new webpack.optimize.CommonsChunkPlugin({
            async: 'roote2ex_codecheck_common-aync',
            chunks: ['route2ex_codecheck_detail', 'route2ex_codecheck_detailreport']
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': process.env.NODE_ENV || 'dev',
            'process.env.ENV_TTL': process.NODE_ENV === 'prod' ? Date.now() : undefined
        }),
        new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,__dirname),
        new webpack.ProvidePlugin({
            '$': "jquery",
            "jQuery": "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.NamedModulesPlugin({
            context:helpers.root('src')
        }),
        new webpack.NamedChunksPlugin()
    ],

    node:{
        global:true,
        process:true,
        Buffer:false,
        crypto:'empty',
        module:false,
        clearImmediate:false,
        setImmediate:false,
        clearTimeout:true,
        setTimeout:true
    }
};

const happypackLoaders = [
    {
        path: 'ts-loader',
        query: { happyPackMode: true }
    },
    isProduction ? 'angular-router-loader ? aot=true & genDir=./aot' : 'angular-router-loader'
];

if(!isProduction)
happypackLoaders.unshift('angular2-template-loader');
consthappypackPluginOptions = {
    id: 'ts',
    loaders: happypackLoaders
};

config.plugins.push(new HappyPack(happypackPluginOptions));
if(isProduction){
    config.plugins.push(new ExtractTextPlugin('[name].[contenthash].css'));
}
module.exports = config;