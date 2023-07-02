//@ts-check

'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**@type {import('webpack').Configuration} */
const config = {
    target: 'node',
    node: false,
    entry: {
        'extension': './src/extension.ts'
    },
    plugins: [
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: 'node_modules/@vscode/codicons/dist',
                        to: './codicons/dist'
                    }
                ]
            })
    ],
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'source-map',
    externals: {
        vscode: 'commonjs vscode'
    },
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