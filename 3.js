const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const commonConfig = require('./webpack.common');
const helpers = require('./helpers/base-helpers.js');
const ExposeAsyncInstallChunkPlugin = require('./helpers/expose-async-install-chucks-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
    devtool:'source-map',
    entry:{
        main:'./src/main.ts',
        vendor:['./src/polyfills.ts','./src/frameworks/vendor.ts']
    },
    output:{
        path: helpers.root('./build'),
        filename:'[name].bundle.js',
        chunkFilename:'app/codecheck/[name].module.js',
        sourceMapFilename:'app/codecheck/[name].module.map',
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
            }]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'src/index.html'
        }),
        new CopyWebpackPlugin([
            {
                context:'src/frameworks/assets/',
                from:'**/*',
                to:'frameworks/assets'
            },
            {
                context:'src/app',
                from:'*/assets/**/*',
                to:'app'
            },
            {
                context:'src/app/',
                from:'*/config/**/*.json',
                to:'app'
            },
            {
                context:'server/WEB-INF',
                from:'**/*',
                to:'WEB-INF'
            },
            {
                context:'src',
                from:'*.ico',
                to:'./'
            },
            {
                context:'src',
                from:'BusinessConfig.json',
                to:'./'
            },
            {
                context:'node_modules/@avennueui/devcloud/assets',
                from:'**/*',
                to:'assets'
            },
            {
                context:'src/frameworks/config',
                from:'app-route-config.js'
            }
        ],
        {
            debug: 'warning'
        }
    ),
    new ExposeAsyncInstallChunkPlugin(),
    new BundleAnayzerPlugin()
    ]
};

module.exports = webpackMerge(commonConfig, config);