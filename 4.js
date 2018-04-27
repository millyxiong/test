const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const baseConfig = require('./webpack.base');
const helpers = require('./helpers/base-helpers.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ExposeAsyncInstallChunkPlugin = require('./helpers/expose-async-install-chucks-plugin');

const config = {
    devtool:'cheap-source-map',
    entry:{
        main:'./src/main-aot.ts',
        vendor:['./src/polyfills.ts','./src/frameworks/vendor.ts']
    },
    output:{
        path: helpers.root('./dist'),
        filename: '[name].[hash].bundle.js',
        chunkFilename:'app/codecheck/[name].[chunkhash].js',
        sourceMapFilename:'app/codecheck/[name].[chunkhash].map',
    },
    module:{
        rules:[
            {
                test:/component\.ts$/,
                loader:'string-replace-loader',
                query:{
                    search:'module.id',
                    replace:'""'
                }
            },
            {
                test: /\.ts$/,
                use: 'happypack/loader?id=ts'
            }
        ]
    },
    plugins:[
        new UglifyJsPlugin({
            parallel: true,
            uglifyOptions:{
                output: {
                    beautify: false,
                    comments: false
                },
                mangle: {
                    // keep_fnames: true
                },
                compress: {
                    warnings: false,
                    //keep_fnames: true,
                    negate_iife: false // we need this for lazy v8
                }
            }
        }),
        new HtmlWebpackPlugin({
            template:'src/index.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        new CopyWebpackPlugin([
            {
                context:'src/frameworks/assets/',
                from:'**/*',
                to:'frameworks/assets',
                ignore: ['css/**', 'libs/js/**', 'libs/css/**']
            },
            {
                context:'src/app',
                from:'*/assets/**/*',
                to:'app',
                ignore: ['css/**', 'js/**']
            },
            {
                context:'src/app/',
                from:'*/config/**/*.json',
                to:'app'
            },
            {
                context:'src',
                from:'*.ico',
                to:'./'
            },
            {
                context:'node_modules/@avenueui/devcloud/assets',
                from:'**/*',
                to:'assets'
            },
            {
                context:'src/frameworks/config',
                from:'app-route-config.js'
            }
        ]),
        new ExposeAsyncInstallChunkPlugin(),
        new webpack.HashedModuleIdsPlugin(),
    ]
};

module.exports = webpackMerge(baseConfig, config);