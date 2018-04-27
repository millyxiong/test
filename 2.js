const webpackMerge = require('webpack-merge');
const helpers = require('./helpers/base-helpers');

const baseConfig = require('./webpack.base');

const config = {
    module:{
        rules:[
            {
                test:/\.ts$/,
                use:[
                    'happypack/loader?id=ts'
                ]
            },
        ]
    }
}

module.exports = webpackMerge(baseConfig, config);