//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration} */
const config = {
    target: 'node',
    entry: {
        'pv': './src/pv.ts'
    },
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: '[name].js',
        libraryTarget: 'this',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    }
};

module.exports = config;